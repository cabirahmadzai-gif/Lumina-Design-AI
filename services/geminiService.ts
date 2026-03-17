import { GoogleGenAI, Type, FunctionDeclaration, Tool, ThinkingLevel } from "@google/genai";
import { ChatMessage, MessageRole, GemstoneAnalysis, AntiqueAnalysis, CoinAnalysis, AnalysisMode, AnalysisResult } from '../types';

export const analyzeItem = async (
  imageBase64: string,
  mode: AnalysisMode,
  itemHint?: string | null
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  try {
    const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
    
    let prompt = '';
    let responseSchema: any = {};

    if (mode === AnalysisMode.GEMSTONE) {
      prompt = `You are an expert gemologist. Analyze this gemstone/rock image with extreme scrutiny and deep focus. Look closely at the crystal structure, cleavage, luster, inclusions, and color zoning. Think step-by-step before making a conclusion. Do not guess; if the image is ambiguous, reflect that in a lower confidence score and state the uncertainty. Provide a highly detailed, professional gemological and mineralogical assessment in Persian (Farsi). Be precise and objective. If the image is blurry or the stone is uncut, state that clearly.`;
      if (itemHint) prompt += ` The user suspects this might be a ${itemHint}.`;
      
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          stoneName: { type: Type.STRING, description: "Precise name of the stone/mineral in Persian" },
          mineralFamily: { type: Type.STRING, description: "Mineral family or group (e.g., Beryl, Corundum) in Persian" },
          hardness: { type: Type.STRING, description: "Mohs hardness scale (e.g., 7.5 - 8) in Persian" },
          refractiveIndex: { type: Type.STRING, description: "Typical Refractive Index (RI) range in Persian" },
          crystalSystem: { type: Type.STRING, description: "Crystal system (e.g., Hexagonal, Cubic) in Persian" },
          authenticity: { type: Type.STRING, description: "Assessment of authenticity: Natural, Synthetic, Treated, or Suspected in Persian" },
          cutType: { type: Type.STRING, description: "Type of cut (e.g., Round Brilliant, Cabochon, Rough/Uncut) in Persian" },
          colorGrade: { type: Type.STRING, description: "Detailed color description (hue, tone, saturation) in Persian" },
          clarity: { type: Type.STRING, description: "Clarity assessment (e.g., VVS, Included, Opaque) in Persian" },
          estimatedCarat: { type: Type.STRING, description: "Estimated carat weight or physical size based on visual proportions in Persian" },
          estimatedValue: { type: Type.STRING, description: "Estimated value range in USD or Tomans in Persian" },
          confidenceScore: { type: Type.NUMBER, description: "Confidence score of this analysis from 0 to 100" },
          furtherTests: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Suggested professional gemological tests in Persian" },
          detectionTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key visual or physical tips for identifying this specific type of stone in Persian" }
        },
        required: ["stoneName", "mineralFamily", "hardness", "refractiveIndex", "crystalSystem", "authenticity", "cutType", "colorGrade", "clarity", "estimatedCarat", "estimatedValue", "confidenceScore", "furtherTests", "detectionTips"]
      };
    } else if (mode === AnalysisMode.ANTIQUE) {
      prompt = `You are an expert antiquarian and historian. Analyze this antique object image with extreme scrutiny and deep focus. Look closely at the patina, wear patterns, manufacturing techniques, tool marks, and stylistic consistency. Think step-by-step before making a conclusion. Be highly critical of potential forgeries or modern reproductions. Provide a highly detailed, professional assessment in Persian (Farsi). Determine if it is authentic or a replica, its age, and country of origin. Be precise and objective.`;
      if (itemHint) prompt += ` The user suspects this might be a ${itemHint}.`;

      responseSchema = {
        type: Type.OBJECT,
        properties: {
          itemName: { type: Type.STRING, description: "Precise name or type of the antique item in Persian" },
          originCountry: { type: Type.STRING, description: "Country or region of origin in Persian" },
          estimatedAge: { type: Type.STRING, description: "Estimated age or creation date in Persian" },
          era: { type: Type.STRING, description: "Historical era or dynasty (e.g., Safavid, Victorian) in Persian" },
          material: { type: Type.STRING, description: "Primary materials used (e.g., Bronze, Ceramic, Silk) in Persian" },
          authenticity: { type: Type.STRING, description: "Assessment of authenticity: Authentic, Replica, Forgery, or Suspected in Persian" },
          condition: { type: Type.STRING, description: "Condition of the item (e.g., Mint, Restored, Damaged) in Persian" },
          historicalSignificance: { type: Type.STRING, description: "Brief historical significance or context in Persian" },
          estimatedValue: { type: Type.STRING, description: "Estimated value range in USD or Tomans in Persian" },
          confidenceScore: { type: Type.NUMBER, description: "Confidence score of this analysis from 0 to 100" },
          furtherTests: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Suggested professional tests (e.g., Carbon dating, XRF) in Persian" },
          detectionTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key visual signs of authenticity or forgery for this item in Persian" }
        },
        required: ["itemName", "originCountry", "estimatedAge", "era", "material", "authenticity", "condition", "historicalSignificance", "estimatedValue", "confidenceScore", "furtherTests", "detectionTips"]
      };
    } else if (mode === AnalysisMode.COIN) {
      prompt = `You are an expert numismatist. Analyze this coin image based on international numismatic standards with extreme scrutiny and deep focus. Look closely at the mint marks, edge lettering, strike quality, wear patterns, and potential casting bubbles or tooling marks. Think step-by-step before making a conclusion. Be highly critical of potential counterfeits. Provide a highly detailed, professional assessment in Persian (Farsi). Determine its authenticity, mint year, ruler, and grade. Be precise and objective.`;
      if (itemHint) prompt += ` The user suspects this might be a ${itemHint}.`;

      responseSchema = {
        type: Type.OBJECT,
        properties: {
          coinName: { type: Type.STRING, description: "Precise name or denomination of the coin in Persian" },
          originCountry: { type: Type.STRING, description: "Country or empire of origin in Persian" },
          mintYear: { type: Type.STRING, description: "Year of minting (Gregorian, Hijri, etc.) in Persian" },
          rulerOrEra: { type: Type.STRING, description: "Ruler, king, or specific era in Persian" },
          composition: { type: Type.STRING, description: "Metal composition (e.g., Gold, Silver, Bronze) in Persian" },
          weightAndSize: { type: Type.STRING, description: "Estimated or standard weight and size in Persian" },
          authenticity: { type: Type.STRING, description: "Assessment of authenticity: Authentic, Counterfeit, Replica in Persian" },
          grade: { type: Type.STRING, description: "Estimated numismatic grade (e.g., MS-65, VF-20) in Persian" },
          obverseDescription: { type: Type.STRING, description: "Description of the obverse (front) side in Persian" },
          reverseDescription: { type: Type.STRING, description: "Description of the reverse (back) side in Persian" },
          estimatedValue: { type: Type.STRING, description: "Estimated value range in USD or Tomans in Persian" },
          confidenceScore: { type: Type.NUMBER, description: "Confidence score of this analysis from 0 to 100" },
          furtherTests: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Suggested professional tests (e.g., Specific gravity, XRF) in Persian" },
          detectionTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key visual signs of authenticity or counterfeiting for this coin in Persian" }
        },
        required: ["coinName", "originCountry", "mintYear", "rulerOrEra", "composition", "weightAndSize", "authenticity", "grade", "obverseDescription", "reverseDescription", "estimatedValue", "confidenceScore", "furtherTests", "detectionTips"]
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from model");
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

const analyzeFunction: FunctionDeclaration = {
  name: 'analyze_item',
  description: 'Analyzes the currently uploaded image (gemstone, antique, or coin) to determine authenticity, details, and value. Call this when the user asks to analyze the item or check if it is real.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      focusArea: {
        type: Type.STRING,
        description: 'Specific aspect the user wants to focus on (e.g., "authenticity", "value", "age").',
      },
    },
  },
};

const functionTool: Tool = {
  functionDeclarations: [analyzeFunction]
};

export const sendChatMessage = async (
  history: ChatMessage[],
  newMessage: string,
  onAnalyzeRequest: () => Promise<void>,
  imageBase64?: string | null,
  mode: AnalysisMode = AnalysisMode.GEMSTONE
): Promise<ChatMessage> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const contents = history.map(msg => ({
    role: msg.role === MessageRole.USER ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  const userParts: any[] = [{ text: newMessage }];
  if (imageBase64) {
    const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
    userParts.unshift({ inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } });
  }

  contents.push({
    role: 'user',
    parts: userParts
  });

  let systemInstruction = "شما یک دستیار هوشمند متخصص هستید. به زبان فارسی پاسخ دهید. با کاربر با احترام و حرفه‌ای برخورد کنید. قبل از پاسخ دادن، با دقت فکر کنید و تمام جزئیات را در نظر بگیرید.";
  if (mode === AnalysisMode.GEMSTONE) {
    systemInstruction += " تخصص فعلی شما جواهرشناسی و کانی‌شناسی است. به سوالات تخصصی درباره سنگ‌ها، نحوه تشخیص اصل از بدل، خواص فیزیکی و شیمیایی و قیمت‌گذاری پاسخ دهید. در تشخیص خود بسیار دقیق و سخت‌گیر باشید.";
  } else if (mode === AnalysisMode.ANTIQUE) {
    systemInstruction += " تخصص فعلی شما عتیقه‌شناسی و تاریخ است. به سوالات درباره اشیای باستانی، تشخیص اصالت، قدمت، کشور سازنده و ارزش آن‌ها پاسخ دهید. در تشخیص خود بسیار دقیق و سخت‌گیر باشید.";
  } else if (mode === AnalysisMode.COIN) {
    systemInstruction += " تخصص فعلی شما سکه‌شناسی (نومیزماتیک) است. به سوالات درباره سکه‌های تاریخی، تشخیص اصالت، سال ضرب، حاکم، درجه‌بندی کیفیت و ارزش آن‌ها بر اساس استانداردهای بین‌المللی پاسخ دهید. در تشخیص خود بسیار دقیق و سخت‌گیر باشید.";
  }
  systemInstruction += " اگر کاربر درخواست بررسی شیء داخل تصویر را داد، از تابع analyze_item استفاده کنید.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        tools: [functionTool],
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      }
    });

    const candidate = response.candidates?.[0];
    const functionCalls = candidate?.content?.parts?.filter(p => p.functionCall).map(p => p.functionCall);
    
    let botText = "";
    
    if (functionCalls && functionCalls.length > 0) {
      for (const call of functionCalls) {
        if (call && call.name === 'analyze_item') {
          botText += "(در حال تحلیل دقیق تصویر شما...)\n";
          await onAnalyzeRequest();
        }
      }
    }

    const textPart = candidate?.content?.parts?.find(p => p.text);
    if (textPart?.text) {
      botText += textPart.text;
    } else if (!botText) {
      botText = "تحلیل انجام شد. نتایج را در پنل مشاهده کنید.";
    }

    return {
      id: Date.now().toString(),
      role: MessageRole.MODEL,
      text: botText,
      timestamp: Date.now(),
    };

  } catch (error) {
    console.error("Chat error:", error);
    return {
      id: Date.now().toString(),
      role: MessageRole.MODEL,
      text: "متاسفانه در ارتباط با سیستم مشکلی پیش آمد. لطفاً دوباره تلاش کنید.",
      timestamp: Date.now(),
      isError: true
    };
  }
};