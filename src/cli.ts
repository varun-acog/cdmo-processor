// src/cli.ts
import DocumentProcessor from "./documentProcessor";
import * as fs from "fs-extra";
import * as path from "path";

const processor = new DocumentProcessor("./documents", "./reports");

async function generateHtmlReport(fileName: string, report: any): Promise<void> {
  let toc = "<h1>Table of Contents</h1><ul>";
  let content = "";

  if (report.materialsReport) {
    const r = report.materialsReport;
    toc += `
      <li>1. Introduction
        <ul>
          <li>1.1 Overview</li>
          <li>1.1.1 Background & Market Context</li>
          <li>1.2 Key Physical and Chemical Properties</li>
          <li>1.2.1 Physical Appearance and Basic Characteristics</li>
          <li>1.2.2 Hazardous Nature and Safety Classifications</li>
          <li>1.3 Market Relevance and Demand Growth</li>
          <li>1.3.1 Major End-Use Industries</li>
          <li>1.3.2 Global and Regional Demand Drivers</li>
        </ul>
      </li>
      <li>2. Chemical Profile and Specifications
        <ul>
          <li>2.1 Chemical Identity and CAS Number</li>
          <li>2.1.1 Synonyms and Chemical Formula</li>
          <li>2.1.2 Molecular Weight and Other Identifiers</li>
          <li>2.2 Purity Levels and Grades</li>
          <li>2.2.1 Industrial vs. Pharmaceutical Grades</li>
          <li>2.2.2 Typical Quality Control Metrics</li>
          <li>2.3 Key Properties</li>
          <li>2.3.1 Boiling Point, Stability, Reactivity</li>
          <li>2.3.2 Polymerization Risks and Inhibitor Requirements</li>
        </ul>
      </li>
      <li>3. Manufacturing Processes and Technologies
        <ul>
          <li>3.1 Primary Production Methods</li>
          <li>3.1.1 Reaction Pathways and Catalysts</li>
          <li>3.1.2 Raw Materials Sourcing</li>
          <li>3.2 Reaction Chemistry and Conditions</li>
          <li>3.2.1 Temperature, Pressure, and Reaction Times</li>
          <li>3.2.2 Byproducts and Waste Management</li>
          <li>3.3 Technical Challenges and Mitigation Strategies</li>
          <li>3.3.1 Equipment Corrosion and Material Selection</li>
          <li>3.3.2 Safety Protocols for Exothermic Reactions</li>
        </ul>
      </li>
      <li>4. Capacity Analysis
        <ul>
          <li>4.1 Global and Regional Capacity Overview</li>
          <li>4.1.1 Major Production Hubs</li>
          <li>4.1.2 Capacity Utilization Trends</li>
          <li>4.2 Utilization Rates and Trends</li>
          <li>4.2.1 Seasonal or Cyclical Fluctuations</li>
          <li>4.2.2 Expansion and Contraction Drivers</li>
          <li>4.3 Key Manufacturing Locations</li>
          <li>4.3.1 North America, Europe, Asia-Pacific</li>
          <li>4.3.2 Emerging Regions</li>
        </ul>
      </li>
      <li>5. Pricing Dynamics
        <ul>
          <li>5.1 Cost Drivers</li>
          <li>5.1.1 Raw Materials and Feedstocks</li>
          <li>5.1.2 Logistics, Regulatory, and Compliance Costs</li>
          <li>5.2 Pricing Structures (Spot vs. Contract)</li>
          <li>5.2.1 Market Volatility Factors</li>
          <li>5.2.2 Contractual Agreements and Terms</li>
          <li>5.3 Historical Pricing Trends and Forecasts</li>
          <li>5.3.1 Price Trajectories</li>
          <li>5.3.2 Market Analyst Projections</li>
        </ul>
      </li>
    `;
    content += `
      <h1>Materials Report</h1>
      <h2>1. Introduction</h2>
      <h3>1.1 Overview</h3>
      <p>Core Function: ${r.introduction.overview.coreFunction || "N/A"}</p>
      <p>Commercialization Date: ${r.introduction.overview.commercializationDate || "N/A"}</p>
      <h4>1.1.1 Background & Market Context</h4>
      <p>${r.introduction.overview.backgroundAndMarketContext || "N/A"}</p>
      <h3>1.2 Key Physical and Chemical Properties</h3>
      <p>Appearance: ${r.introduction.properties.appearance || "N/A"}</p>
      <p>Hazards: ${r.introduction.properties.hazards || "N/A"}</p>
      <h4>1.2.1 Physical Appearance and Basic Characteristics</h4>
      <p>${r.introduction.properties.characteristics || "N/A"}</p>
      <h4>1.2.2 Hazardous Nature and Safety Classifications</h4>
      <p>${r.introduction.properties.safety || "N/A"}</p>
      <h3>1.3 Market Relevance and Demand Growth</h3>
      <h4>1.3.1 Major End-Use Industries</h4>
      <p>${r.introduction.marketRelevance.industries || "N/A"}</p>
      <h4>1.3.2 Global and Regional Demand Drivers</h4>
      <p>${r.introduction.marketRelevance.demandDrivers || "N/A"}</p>
      <h2>2. Chemical Profile and Specifications</h2>
      <h3>2.1 Chemical Identity and CAS Number</h3>
      <p>Name: ${r.chemicalProfile.identity.name || "N/A"}</p>
      <p>Formula: ${r.chemicalProfile.identity.formula || "N/A"}</p>
      <p>CAS: ${r.chemicalProfile.identity.cas || "N/A"}</p>
      <h4>2.1.1 Synonyms and Chemical Formula</h4>
      <p>${r.chemicalProfile.identity.synonyms || "N/A"}</p>
      <h4>2.1.2 Molecular Weight and Other Identifiers</h4>
      <p>${r.chemicalProfile.identity.molecularWeight || "N/A"}</p>
      <h3>2.2 Purity Levels and Grades</h3>
      <p>Grades: ${r.chemicalProfile.purity.grades || "N/A"}</p>
      <h4>2.2.1 Industrial vs. Pharmaceutical Grades</h4>
      <p>${r.chemicalProfile.purity.grades || "N/A"}</p>
      <h4>2.2.2 Typical Quality Control Metrics</h4>
      <p>${r.chemicalProfile.purity.qualityControl || "N/A"}</p>
      <h3>2.3 Key Properties</h3>
      <h4>2.3.1 Boiling Point, Stability, Reactivity</h4>
      <p>${r.chemicalProfile.properties.boilingPoint || "N/A"}</p>
      <h4>2.3.2 Polymerization Risks and Inhibitor Requirements</h4>
      <p>${r.chemicalProfile.properties.polymerizationRisks || "N/A"}</p>
      <h2>3. Manufacturing Processes and Technologies</h2>
      <h3>3.1 Primary Production Methods</h3>
      <h4>3.1.1 Reaction Pathways and Catalysts</h4>
      <p>${r.manufacturing.methods.pathways || "N/A"}</p>
      <h4>3.1.2 Raw Materials Sourcing</h4>
      <p>${r.manufacturing.methods.rawMaterials || "N/A"}</p>
      <h3>3.2 Reaction Chemistry and Conditions</h3>
      <h4>3.2.1 Temperature, Pressure, and Reaction Times</h4>
      <p>${r.manufacturing.chemistry.conditions || "N/A"}</p>
      <h4>3.2.2 Byproducts and Waste Management</h4>
      <p>${r.manufacturing.chemistry.byproducts || "N/A"}</p>
      <h3>3.3 Technical Challenges and Mitigation Strategies</h3>
      <h4>3.3.1 Equipment Corrosion and Material Selection</h4>
      <p>${r.manufacturing.challenges.corrosion || "N/A"}</p>
      <h4>3.3.2 Safety Protocols for Exothermic Reactions</h4>
      <p>${r.manufacturing.challenges.safetyProtocols || "N/A"}</p>
      <h2>4. Capacity Analysis</h2>
      <h3>4.1 Global and Regional Capacity Overview</h3>
      <h4>4.1.1 Major Production Hubs</h4>
      <p>${r.capacity.overview.hubs || "N/A"}</p>
      <h4>4.1.2 Capacity Utilization Trends</h4>
      <p>${r.capacity.overview.utilizationTrends || "N/A"}</p>
      <h3>4.2 Utilization Rates and Trends</h3>
      <h4>4.2.1 Seasonal or Cyclical Fluctuations</h4>
      <p>${r.capacity.rates.fluctuations || "N/A"}</p>
      <h4>4.2.2 Expansion and Contraction Drivers</h4>
      <p>${r.capacity.rates.drivers || "N/A"}</p>
      <h3>4.3 Key Manufacturing Locations</h3>
      <h4>4.3.1 North America, Europe, Asia-Pacific</h4>
      <p>${r.capacity.locations.regions || "N/A"}</p>
      <h4>4.3.2 Emerging Regions</h4>
      <p>${r.capacity.locations.emerging || "N/A"}</p>
      <h2>5. Pricing Dynamics</h2>
      <h3>5.1 Cost Drivers</h3>
      <h4>5.1.1 Raw Materials and Feedstocks</h4>
      <p>${r.pricing.costDrivers.rawMaterials || "N/A"}</p>
      <h4>5.1.2 Logistics, Regulatory, and Compliance Costs</h4>
      <p>${r.pricing.costDrivers.logistics || "N/A"}</p>
      <h3>5.2 Pricing Structures (Spot vs. Contract)</h3>
      <h4>5.2.1 Market Volatility Factors</h4>
      <p>${r.pricing.structures.volatility || "N/A"}</p>
      <h4>5.2.2 Contractual Agreements and Terms</h4>
      <p>${r.pricing.structures.agreements || "N/A"}</p>
      <h3>5.3 Historical Pricing Trends and Forecasts</h3>
      <h4>5.3.1 Price Trajectories</h4>
      <p>${r.pricing.trends.trajectories || "N/A"}</p>
      <h4>5.3.2 Market Analyst Projections</h4>
      <p>${r.pricing.trends.projections || "N/A"}</p>
    `;
  } else if (report.supplierReport) {
    const r = report.supplierReport;
    toc += `
      <li>1. Executive Summary
        <ul>
          <li>1.1 Purpose and Scope</li>
          <li>1.1.1 Overview of Supplier Evaluation</li>
          <li>1.2 Key Highlights</li>
          <li>1.2.1 Major Differentiators</li>
          <li>1.2.2 Summary of Findings</li>
        </ul>
      </li>
      <li>2. Supplier Profiles
        <ul>
          <li>2.1 Company Background and General Information</li>
          <li>2.1.1 Founding History and Ownership</li>
          <li>2.1.2 Current Leadership and Structure</li>
          <li>2.2 Manufacturing Capabilities and Capacities</li>
          <li>2.2.1 Plant Facilities and Technologies</li>
          <li>2.2.2 Annual Production Volumes and Scalability</li>
          <li>2.3 Geographic Presence and Infrastructure</li>
          <li>2.3.1 Distribution Hubs and Logistics Networks</li>
          <li>2.3.2 Regional and International Markets</li>
        </ul>
      </li>
      <li>3. Supplier Quality and Certifications
        <ul>
          <li>3.1 Compliance with Industry Standards</li>
          <li>3.1.1 ISO and GMP Certifications</li>
          <li>3.1.2 REACH, TSCA, or Other Registrations</li>
          <li>3.2 Quality Assurance and Control Systems</li>
          <li>3.2.1 Lab Testing Methods (GC/MS, HPLC, etc.)</li>
          <li>3.2.2 Documentation & Traceability</li>
          <li>3.3 Audit History and Certifications</li>
          <li>3.3.1 Internal Audits and Findings</li>
          <li>3.3.2 Customer Audit Outcomes</li>
        </ul>
      </li>
      <li>4. Pricing and Contract Terms
        <ul>
          <li>4.1 Pricing Structures</li>
          <li>4.1.1 Spot Purchasing vs. Long-Term Contracts</li>
          <li>4.1.2 Volume Discounts or Rebates</li>
          <li>4.2 Payment Terms and Financial Stability</li>
          <li>4.2.1 Typical Net Payment Days</li>
          <li>4.2.2 Credit Risk Assessments</li>
          <li>4.3 Negotiation Levers and Cost Transparency</li>
          <li>4.3.1 Index-Linked Pricing</li>
          <li>4.3.2 Open-Book Policy</li>
        </ul>
      </li>
      <li>5. Supply Reliability and Risks
        <ul>
          <li>5.1 Historical Delivery Performance</li>
          <li>5.1.1 On-Time Delivery Metrics</li>
          <li>5.1.2 Lead Time Consistency</li>
          <li>5.2 Risk Factors</li>
          <li>5.2.1 Operational, Geopolitical, Environmental</li>
          <li>5.2.2 Force Majeure or Unexpected Disruptions</li>
          <li>5.3 Contingency Measures and Disaster Recovery Plans</li>
          <li>5.3.1 Backup Power and Redundancy</li>
          <li>5.3.2 Alternate Shipping Routes</li>
        </ul>
      </li>
    `;
    content += `
      <h1>Supplier Report</h1>
      <h2>1. Executive Summary</h2>
      <h3>1.1 Purpose and Scope</h3>
      <p>Reason: ${r.executiveSummary.purpose.reason || "N/A"}</p>
      <p>Products: ${r.executiveSummary.purpose.products || "N/A"}</p>
      <h4>1.1.1 Overview of Supplier Evaluation</h4>
      <p>${r.executiveSummary.purpose.evaluationOverview || "N/A"}</p>
      <h3>1.2 Key Highlights</h3>
      <p>Differentiators: ${r.executiveSummary.highlights.differentiators || "N/A"}</p>
      <p>Findings: ${r.executiveSummary.highlights.findings || "N/A"}</p>
      <h2>2. Supplier Profiles</h2>
      <h3>2.1 Company Background and General Information</h3>
      <p>History: ${r.supplierProfiles.background.history || "N/A"}</p>
      <p>Ownership: ${r.supplierProfiles.background.ownership || "N/A"}</p>
      <h4>2.1.1 Founding History and Ownership</h4>
      <p>${r.supplierProfiles.background.history || "N/A"}</p>
      <h4>2.1.2 Current Leadership and Structure</h4>
      <p>${r.supplierProfiles.background.leadership || "N/A"}</p>
      <h3>2.2 Manufacturing Capabilities and Capacities</h3>
      <p>Facilities: ${r.supplierProfiles.capabilities.facilities || "N/A"}</p>
      <p>Volumes: ${r.supplierProfiles.capabilities.volumes || "N/A"}</p>
      <h4>2.2.1 Plant Facilities and Technologies</h4>
      <p>${r.supplierProfiles.capabilities.facilities || "N/A"}</p>
      <h4>2.2.2 Annual Production Volumes and Scalability</h4>
      <p>${r.supplierProfiles.capabilities.volumes || "N/A"}</p>
      <h3>2.3 Geographic Presence and Infrastructure</h3>
      <h4>2.3.1 Distribution Hubs and Logistics Networks</h4>
      <p>${r.supplierProfiles.geographic.distribution || "N/A"}</p>
      <h4>2.3.2 Regional and International Markets</h4>
      <p>${r.supplierProfiles.geographic.markets || "N/A"}</p>
      <h2>3. Supplier Quality and Certifications</h2>
      <h3>3.1 Compliance with Industry Standards</h3>
      <p>Standards: ${r.quality.compliance.standards || "N/A"}</p>
      <p>Registrations: ${r.quality.compliance.registrations || "N/A"}</p>
      <h4>3.1.1 ISO and GMP Certifications</h4>
      <p>${r.quality.compliance.standards || "N/A"}</p>
      <h4>3.1.2 REACH, TSCA, or Other Registrations</h4>
      <p>${r.quality.compliance.registrations || "N/A"}</p>
      <h3>3.2 Quality Assurance and Control Systems</h3>
      <h4>3.2.1 Lab Testing Methods (GC/MS, HPLC, etc.)</h4>
      <p>${r.quality.assurance.testing || "N/A"}</p>
      <h4>3.2.2 Documentation & Traceability</h4>
      <p>${r.quality.assurance.traceability || "N/A"}</p>
      <h3>3.3 Audit History and Certifications</h3>
      <h4>3.3.1 Internal Audits and Findings</h4>
      <p>${r.quality.audits.internal || "N/A"}</p>
      <h4>3.3.2 Customer Audit Outcomes</h4>
      <p>${r.quality.audits.customer || "N/A"}</p>
      <h2>4. Pricing and Contract Terms</h2>
      <h3>4.1 Pricing Structures</h3>
      <h4>4.1.1 Spot Purchasing vs. Long-Term Contracts</h4>
      <p>${r.pricing.structures.spotVsContract || "N/A"}</p>
      <h4>4.1.2 Volume Discounts or Rebates</h4>
      <p>${r.pricing.structures.discounts || "N/A"}</p>
      <h3>4.2 Payment Terms and Financial Stability</h3>
      <h4>4.2.1 Typical Net Payment Days</h4>
      <p>${r.pricing.terms.paymentDays || "N/A"}</p>
      <h4>4.2.2 Credit Risk Assessments</h4>
      <p>${r.pricing.terms.creditRisk || "N/A"}</p>
      <h3>4.3 Negotiation Levers and Cost Transparency</h3>
      <h4>4.3.1 Index-Linked Pricing</h4>
      <p>${r.pricing.negotiation.indexPricing || "N/A"}</p>
      <h4>4.3.2 Open-Book Policy</h4>
      <p>${r.pricing.negotiation.transparency || "N/A"}</p>
      <h2>5. Supply Reliability and Risks</h2>
      <h3>5.1 Historical Delivery Performance</h3>
      <h4>5.1.1 On-Time Delivery Metrics</h4>
      <p>${r.reliability.performance.deliveryMetrics || "N/A"}</p>
      <h4>5.1.2 Lead Time Consistency</h4>
      <p>${r.reliability.performance.leadTime || "N/A"}</p>
      <h3>5.2 Risk Factors</h3>
      <h4>5.2.1 Operational, Geopolitical, Environmental</h4>
      <p>${r.reliability.risks.factors || "N/A"}</p>
      <h4>5.2.2 Force Majeure or Unexpected Disruptions</h4>
      <p>${r.reliability.risks.disruptions || "N/A"}</p>
      <h3>5.3 Contingency Measures and Disaster Recovery Plans</h3>
      <h4>5.3.1 Backup Power and Redundancy</h4>
      <p>${r.reliability.contingency.redundancy || "N/A"}</p>
      <h4>5.3.2 Alternate Shipping Routes</h4>
      <p>${r.reliability.contingency.routes || "N/A"}</p>
    `;
  }

  toc += "</ul>";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>CDMO Report - ${fileName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        h2 { color: #555; }
        h3 { color: #777; }
        h4 { color: #999; }
        ul { list-style-type: none; padding-left: 20px; }
        p { margin: 5px 0; }
      </style>
    </head>
    <body>
      ${toc}
      ${content}
    </body>
    </html>
  `;
  await fs.writeFile(path.join("./reports", `${fileName.split(".")[0]}.html`), html);
  console.log(`Report generated: reports/${fileName.split(".")[0]}.html`);
}

async function main() {
  const [command, ...args] = process.argv.slice(2);

  if (command === "report") {
    const fileName = args[0];
    if (!fileName || !fs.existsSync(path.join("./documents", fileName))) {
      console.error("Error: Provide a valid file name in documents/.");
      process.exit(1);
    }
    const report = await processor.generateReport(fileName);
    await generateHtmlReport(fileName, report);
  } else if (command === "query") {
    const query = args.join(" ");
    if (!query) {
      console.error("Error: Provide a query string.");
      process.exit(1);
    }
    const response = await processor.queryWithRAG(query);
    console.log("Response:", response);
  } else {
    console.log("Usage:");
    console.log("  node cli.js report <file> - Generate report and store embeddings");
    console.log("  node cli.js query <question> - Query documents using RAG");
  }
}

main().catch(console.error);