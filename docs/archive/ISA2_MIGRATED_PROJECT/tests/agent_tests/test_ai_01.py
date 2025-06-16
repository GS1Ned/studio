import pytest
from isa.agents.agent import ISAAgent

class DummyTool:
    def run(self, query): return "GTIN betekent Global Trade Item Number"

def test_ai_01_basic_query():
    agent = ISAAgent(tools={})
    agent.tools = {"vector": DummyTool(), "kg": DummyTool(), "validate": DummyTool()}
    result = agent.ask("Wat betekent AI 01 binnen GS1?")
    assert "GTIN" in result
