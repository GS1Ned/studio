"""ISA Agent Core - Orchestrates prompt-based tool selection and LLM interaction.""" 
from isa.agents.tool_router import route_query

class ISAAgent:
    def __init__(self, tools):
        self.tools = tools

    def ask(self, query):
        tool = route_query(query)
        return tool.run(query)
