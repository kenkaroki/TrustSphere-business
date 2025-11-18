from google import genai
from app.config import get_settings
import json
from typing import Dict, Any, List

settings = get_settings()
client = genai.Client(api_key=settings.gemini_api_key)

class GeminiService:
    def __init__(self):
        self.model = "gemini-2.0-flash"
    
    async def get_business_insights(self, business_data: Dict[str, Any]) -> str:
        """Generate AI-powered business insights"""
        prompt = f"""
        As a business growth expert, analyze this business and provide actionable insights:
        
        Business Name: {business_data.get('name')}
        Industry: {business_data.get('industry')}
        Description: {business_data.get('description')}
        
        Provide:
        1. Key strengths and opportunities
        2. Potential challenges
        3. 3-5 specific growth strategies
        4. Market positioning advice
        
        Be specific, actionable, and concise.
        """
        
        response = client.models.generate_content(
            model=self.model,
            contents=prompt
        )
        return response.text
    
    async def analyze_metrics(self, metrics: List[Dict[str, Any]]) -> str:
        """Analyze business metrics and trends"""
        metrics_summary = "\n".join([
            f"- {m['metric_type']}: {m['value']} ({m['period']})"
            for m in metrics
        ])
        
        prompt = f"""
        As a business analyst, analyze these metrics and provide insights:
        
        {metrics_summary}
        
        Provide:
        1. Trend analysis
        2. Performance assessment
        3. Areas needing attention
        4. Recommendations for improvement
        
        Be data-driven and specific.
        """
        
        response = client.models.generate_content(
            model=self.model,
            contents=prompt
        )
        return response.text
    
    async def generate_growth_plan(self, business_data: Dict[str, Any], timeframe: str = "6 months") -> Dict[str, Any]:
        """Generate a comprehensive growth plan"""
        prompt = f"""
        Create a detailed {timeframe} growth plan for:
        
        Business: {business_data.get('name')}
        Industry: {business_data.get('industry')}
        Current State: {business_data.get('description')}
        
        Provide a structured growth plan with:
        1. Revenue growth strategies
        2. Customer acquisition tactics
        3. Operational improvements
        4. Marketing initiatives
        5. Technology recommendations
        
        Format as JSON with categories, priorities, and action items.
        """
        
        response = client.models.generate_content(
            model=self.model,
            contents=prompt
        )
        return self._parse_structured_response(response.text)
    
    async def get_market_insights(self, industry: str, business_context: str = "") -> str:
        """Get market trends and insights for an industry"""
        prompt = f"""
        Provide current market insights for the {industry} industry:
        
        Context: {business_context}
        
        Include:
        1. Current market trends
        2. Growth opportunities
        3. Competitive landscape
        4. Consumer behavior shifts
        5. Technology innovations
        
        Be current, relevant, and actionable for SMEs.
        """
        
        response = client.models.generate_content(
            model=self.model,
            contents=prompt
        )
        return response.text
    
    async def answer_business_question(self, question: str, business_context: Dict[str, Any]) -> str:
        """Answer specific business questions with context"""
        context_str = "\n".join([f"{k}: {v}" for k, v in business_context.items()])
        
        prompt = f"""
        As a business advisor, answer this question with expertise:
        
        Question: {question}
        
        Business Context:
        {context_str}
        
        Provide a clear, actionable answer tailored to this specific business.
        """
        
        response = client.models.generate_content(
            model=self.model,
            contents=prompt
        )
        return response.text
    
    async def generate_recommendations(self, business_data: Dict[str, Any], focus_area: str = "general") -> List[Dict[str, Any]]:
        """Generate prioritized recommendations"""
        prompt = f"""
        Generate 5 prioritized recommendations for:
        
        Business: {business_data.get('name')}
        Industry: {business_data.get('industry')}
        Focus: {focus_area}
        
        For each recommendation, provide:
        - Title (brief)
        - Description (2-3 sentences)
        - Priority (high/medium/low)
        - Category (marketing/operations/finance/technology/sales)
        - 3 specific action items
        
        Format as JSON array.
        """
        
        response = client.models.generate_content(
            model=self.model,
            contents=prompt
        )
        return self._parse_recommendations(response.text)
    
    def _parse_structured_response(self, response_text: str) -> Dict[str, Any]:
        """Parse structured JSON response from AI"""
        try:
            # Try to extract JSON from markdown code blocks
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                json_str = response_text[json_start:json_end].strip()
                return json.loads(json_str)
            elif "```" in response_text:
                json_start = response_text.find("```") + 3
                json_end = response_text.find("```", json_start)
                json_str = response_text[json_start:json_end].strip()
                return json.loads(json_str)
            else:
                return json.loads(response_text)
        except:
            return {"raw_response": response_text}
    
    def _parse_recommendations(self, response_text: str) -> List[Dict[str, Any]]:
        """Parse recommendations from AI response"""
        try:
            structured = self._parse_structured_response(response_text)
            if isinstance(structured, list):
                return structured
            elif isinstance(structured, dict) and "recommendations" in structured:
                return structured["recommendations"]
            else:
                return [structured]
        except:
            return [{"title": "AI Response", "description": response_text, "priority": "medium", "category": "general", "action_items": []}]

# Singleton instance
gemini_service = GeminiService()
