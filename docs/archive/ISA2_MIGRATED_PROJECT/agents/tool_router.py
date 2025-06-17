"""Maps user queries to specific tools (vector search, KG query, validation)."""

def route_query(query):
    if "validatie" in query.lower() or "controleer" in query.lower():
        from isa.tools.validation_tool import ValidationTool
        return ValidationTool()
    elif "leg uit" in query.lower() or "wat betekent" in query.lower():
        from isa.tools.kg_query_tool import KnowledgeGraphTool
        return KnowledgeGraphTool()
    else:
        from isa.tools.vector_search_tool import VectorSearchTool
        return VectorSearchTool()
