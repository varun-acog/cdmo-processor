// src/documentProcessor.ts
import MyLamaInstance from "../lib/MyLama";
import * as fs from "fs-extra";
import * as path from "path";
import pdfParse from "pdf-parse";
import * as yaml from "js-yaml";
import { IndexFlatL2 } from "faiss-node";
import OpenAI from "openai";

interface MaterialsReport {
  introduction: {
    overview: { coreFunction: string | null; commercializationDate: string | null; backgroundAndMarketContext: string | null };
    properties: { appearance: string | null; hazards: string | null; characteristics: string | null; safety: string | null };
    marketRelevance: { industries: string | null; demandDrivers: string | null };
  };
  chemicalProfile: {
    identity: { name: string | null; formula: string | null; cas: string | null; synonyms: string | null; molecularWeight: string | null };
    purity: { grades: string | null; qualityControl: string | null };
    properties: { boilingPoint: string | null; polymerizationRisks: string | null };
  };
  manufacturing: {
    methods: { pathways: string | null; rawMaterials: string | null };
    chemistry: { conditions: string | null; byproducts: string | null };
    challenges: { corrosion: string | null; safetyProtocols: string | null };
  };
  capacity: {
    overview: { hubs: string | null; utilizationTrends: string | null };
    rates: { fluctuations: string | null; drivers: string | null };
    locations: { regions: string | null; emerging: string | null };
  };
  pricing: {
    costDrivers: { rawMaterials: string | null; logistics: string | null };
    structures: { volatility: string | null; agreements: string | null };
    trends: { trajectories: string | null; projections: string | null };
  };
}

interface SupplierReport {
  executiveSummary: {
    purpose: { reason: string | null; products: string | null; evaluationOverview: string | null };
    highlights: { differentiators: string | null; findings: string | null };
  };
  supplierProfiles: {
    background: { history: string | null; ownership: string | null; leadership: string | null };
    capabilities: { facilities: string | null; volumes: string | null };
    geographic: { distribution: string | null; markets: string | null };
  };
  quality: {
    compliance: { standards: string | null; registrations: string | null };
    assurance: { testing: string | null; traceability: string | null };
    audits: { internal: string | null; customer: string | null };
  };
  pricing: {
    structures: { spotVsContract: string | null; discounts: string | null };
    terms: { paymentDays: string | null; creditRisk: string | null };
    negotiation: { indexPricing: string | null; transparency: string | null };
  };
  reliability: {
    performance: { deliveryMetrics: string | null; leadTime: string | null };
    risks: { factors: string | null; disruptions: string | null };
    contingency: { redundancy: string | null; routes: string | null };
  };
}

interface ReportResult {
  materialsReport?: MaterialsReport;
  supplierReport?: SupplierReport;
}

interface DocumentMetadata {
  fileName: string;
  text: string;
  timestamp: string;
  chunkId: number;
}

interface FaissSearchResult {
  distances: number[];
  labels: number[];
}

class DocumentProcessor {
  private lama: typeof MyLamaInstance;
  private documentsDir: string;
  private reportsDir: string;
  private prompts: any;
  private faissIndex: IndexFlatL2 | null;
  private metadata: DocumentMetadata[];
  private openai: OpenAI;
  private dimension: number = 1536;

  constructor(documentsDir: string, reportsDir: string) {
    this.lama = MyLamaInstance;
    this.documentsDir = documentsDir;
    this.reportsDir = reportsDir;
    this.prompts = yaml.load(fs.readFileSync(path.join(__dirname, "../config/prompts.yaml"), "utf8"));
    this.faissIndex = null;
    this.metadata = [];
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
    this.loadIndex();
  }

  private async initializeIndex(): Promise<void> {
    if (!this.faissIndex) {
      this.faissIndex = new IndexFlatL2(this.dimension);
    }
  }

  private async loadIndex(): Promise<void> {
    const indexPath = path.join(this.reportsDir, "faiss_index.bin");
    const metadataPath = path.join(this.reportsDir, "faiss_metadata.json");
    if (fs.existsSync(indexPath) && fs.existsSync(metadataPath)) {
      this.faissIndex = IndexFlatL2.read(indexPath);
      this.metadata = JSON.parse(await fs.readFile(metadataPath, "utf8"));
      console.log("Loaded existing FAISS index and metadata");
    }
  }

  private async saveIndex(): Promise<void> {
    if (this.faissIndex) {
      const indexPath = path.join(this.reportsDir, "faiss_index.bin");
      const metadataPath = path.join(this.reportsDir, "faiss_metadata.json");
      this.faissIndex.write(indexPath);
      await fs.writeFile(metadataPath, JSON.stringify(this.metadata, null, 2));
      console.log("Saved FAISS index and metadata");
    }
  }

  async extractText(filePath: string): Promise<string> {
    const dataBuffer = await fs.readFile(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text;
  }

  private cleanJsonResponse(response: string): string {
    // Remove Markdown markers and extract only the JSON portion
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      return jsonMatch[1].trim();
    }
    // Fallback: If no Markdown, try to extract JSON by finding first { to last }
    const start = response.indexOf("{");
    const end = response.lastIndexOf("}") + 1;
    if (start !== -1 && end !== -1) {
      return response.slice(start, end).trim();
    }
    throw new Error("No valid JSON found in response");
  }

  private chunkText(text: string, maxTokens: number = 4000): string[] {
    const maxChars = maxTokens * 4;
    const chunks: string[] = [];
    let currentChunk = "";

    for (const line of text.split("\n")) {
      if ((currentChunk.length + line.length) > maxChars) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = line;
      } else {
        currentChunk += "\n" + line;
      }
    }
    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
  }

  async detectReportType(text: string): Promise<"materials" | "supplier"> {
    const detectionPrompt = this.prompts.cdmo_reports.detectType.replace("{{text}}", text);
    const response = await this.lama.generate(detectionPrompt);
    const cleanedResponse = this.cleanJsonResponse(response);
    const parsed = JSON.parse(cleanedResponse);
    return parsed.type === "materials" ? "materials" : "supplier";
  }

  async generateReport(fileName: string): Promise<ReportResult> {
    const filePath = path.join(this.documentsDir, fileName);
    const text = await this.extractText(filePath);
    const reportType = await this.detectReportType(text);
    const result: ReportResult = {};

    if (reportType === "materials") {
      const materialsPrompt = this.prompts.cdmo_reports.materialsReport.replace("{{text}}", text);
      const materialsResponse = await this.lama.generate(materialsPrompt);
      result.materialsReport = JSON.parse(this.cleanJsonResponse(materialsResponse));
    } else {
      const supplierPrompt = this.prompts.cdmo_reports.supplierReport.replace("{{text}}", text);
      const supplierResponse = await this.lama.generate(supplierPrompt);
      result.supplierReport = JSON.parse(this.cleanJsonResponse(supplierResponse));
    }

    await this.storeEmbeddings(fileName, text);
    return result;
  }

  async storeEmbeddings(fileName: string, text: string): Promise<void> {
    await this.initializeIndex();
    const chunks = this.chunkText(text);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        const embeddingResponse = await this.openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: chunk,
        });
        const embedding = embeddingResponse.data[0].embedding;

        this.faissIndex!.add(embedding);
        this.metadata.push({
          fileName,
          text: chunk,
          timestamp: new Date().toISOString(),
          chunkId: i,
        });
      } catch (error) {
        console.error(`Error embedding chunk ${i} of ${fileName}:`, error);
      }
    }
    await this.saveIndex();
    console.log(`Embeddings stored for ${fileName} in FAISS (${chunks.length} chunks)`);
  }

  async queryWithRAG(query: string): Promise<string> {
    await this.loadIndex();
    if (!this.faissIndex || this.metadata.length === 0) {
      return "No documents indexed yet.";
    }

    const queryEmbeddingResponse = await this.openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: query,
    });
    const queryEmbedding = queryEmbeddingResponse.data[0].embedding;

    const result = this.faissIndex!.search(queryEmbedding, 3) as FaissSearchResult;
    const { distances, labels } = result;
    const contexts = labels
      .map((index: number) => this.metadata[index]?.text)
      .filter(Boolean);

    if (!contexts.length) {
      return "No relevant information found in the documents.";
    }

    const augmentedPrompt = `
      Using the following context from CDMO documents, answer the query: "${query}"
      
      Context:
      ${contexts.join("\n\n")}
      
      Provide a concise, natural language response based on the context.
    `;

    const response = await this.lama.generate(augmentedPrompt);
    return response;
  }
}

export default DocumentProcessor;