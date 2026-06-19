# Prism AI Adaptation Studio - Architecture

## System Architecture Diagram

```mermaid
flowchart TB
    User([User])
    
    subgraph Frontend["🎨 Frontend Layer (Next.js)"]
        UI[Next.js UI<br/>React Components]
        Upload[Story Upload]
        Display[Results Display]
    end
    
    subgraph Backend["⚙️ Backend Layer (API Routes)"]
        API1["/api/analyze-creative-dna"]
        API2["/api/recommend-adaptation"]
        API3["/api/generate-production-blueprint"]
    end
    
    subgraph AI["🤖 IBM AI Layer"]
        Granite["IBM Granite 4 H Small<br/>ibm/granite-4-h-small<br/>via watsonx.ai"]
        Prompts["System Prompts<br/>Creative DNA | Adaptation | Blueprint"]
    end
    
    subgraph Validation["✅ Validation & Processing"]
        Parse["JSON Parsing"]
        Schema["Ajv 2020-12<br/>Schema Validation"]
        Correct["Auto-correction<br/>& Normalization"]
    end
    
    subgraph Human["👤 Human Decision Points"]
        Accept1{"Accept DNA?"}
        Accept2{"Accept<br/>Recommendation?"}
    end
    
    subgraph Fallback["🔄 Demo Fallback System"]
        Check{"Demo Story<br/>or Quota<br/>Unavailable?"}
        Fixtures["Schema-valid<br/>Demo Fixtures"]
    end
    
    subgraph Output["📋 Final Output"]
        Blueprint["Production Blueprint<br/>Comprehensive Adaptation Plan"]
    end
    
    subgraph Hosting["☁️ Hosting"]
        Vercel[Vercel Platform]
    end
    
    User -->|Uploads Story| Upload
    Upload --> UI
    UI --> API1
    
    API1 --> Check
    Check -->|Yes| Fixtures
    Check -->|No| Granite
    
    Fixtures -.->|Demo Mode| Parse
    Granite -->|AI Response| Parse
    Prompts -.->|Guides| Granite
    
    Parse --> Schema
    Schema -->|Invalid| Correct
    Schema -->|Valid| Accept1
    Correct --> Accept1
    
    Accept1 -->|Yes| Display
    Accept1 -->|No| Upload
    Display --> API2
    
    API2 --> Check
    Check -->|AI or Demo| Parse
    Parse --> Schema
    Schema --> Accept2
    
    Accept2 -->|Yes| API3
    Accept2 -->|No| API2
    
    API3 --> Check
    Check -->|AI or Demo| Parse
    Parse --> Schema
    Schema --> Blueprint
    
    Blueprint --> Display
    Display --> User
    
    Vercel -.->|Hosts| Frontend
    Vercel -.->|Hosts| Backend
    
    classDef userStyle fill:#e1f5ff,stroke:#0066cc,stroke-width:3px
    classDef frontendStyle fill:#fff4e6,stroke:#ff9800,stroke-width:2px
    classDef backendStyle fill:#e8f5e9,stroke:#4caf50,stroke-width:2px
    classDef aiStyle fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px
    classDef validationStyle fill:#fff3e0,stroke:#ff6f00,stroke-width:2px
    classDef humanStyle fill:#ffebee,stroke:#d32f2f,stroke-width:2px
    classDef fallbackStyle fill:#e0f2f1,stroke:#00897b,stroke-width:2px
    classDef outputStyle fill:#e8eaf6,stroke:#3f51b5,stroke-width:3px
    classDef hostingStyle fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    
    class User userStyle
    class UI,Upload,Display frontendStyle
    class API1,API2,API3 backendStyle
    class Granite,Prompts aiStyle
    class Parse,Schema,Correct validationStyle
    class Accept1,Accept2 humanStyle
    class Check,Fixtures fallbackStyle
    class Blueprint outputStyle
    class Vercel hostingStyle
```

## Legend

### Operating Modes

| Mode | Description | Trigger |
|------|-------------|---------|
| **🟢 Live Mode** | Full AI pipeline using IBM Granite 4 H Small (ibm/granite-4-h-small) via watsonx.ai | Default for all stories when quota available |
| **🟡 Demo Mode** | Transparent fallback using pre-validated fixtures | Activated for included demo story OR when watsonx.ai quota unavailable |

### Data Flow

- **Solid arrows (→)**: Primary data flow through the system
- **Dashed arrows (⇢)**: Supporting relationships (hosting, guidance, fallback)

### Key Components

1. **Frontend Layer**: Next.js React application with user interface
2. **Backend Layer**: Three API routes handling the three-stage pipeline
3. **IBM AI Layer**: IBM Granite 4 H Small (ibm/granite-4-h-small) model accessed through watsonx.ai with specialized prompts
4. **Validation Layer**: JSON parsing, Ajv schema validation, and automatic correction
5. **Human Decision Points**: User acceptance gates between pipeline stages
6. **Demo Fallback**: Transparent system using schema-valid fixtures when needed
7. **Final Output**: Production Blueprint with comprehensive adaptation details
8. **Hosting**: Vercel platform hosting both frontend and backend

### Pipeline Stages

1. **Creative DNA Analysis**: Extract narrative elements, themes, and structure
2. **Adaptation Recommendation**: Suggest optimal format and approach
3. **Production Blueprint**: Generate comprehensive production plan

Each stage includes:
- AI generation or demo fallback
- JSON parsing and validation
- Automatic correction if needed
- Human acceptance decision
- Structured output to next stage
