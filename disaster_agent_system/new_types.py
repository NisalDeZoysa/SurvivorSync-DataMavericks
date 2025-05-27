from enum import Enum
from typing import Any, Literal

from pydantic import BaseModel, Field, RootModel


class AgentSkill(BaseModel):
    """
    Represents a unit of capability that an agent can perform.
    """

    description: str
    """
    Description of the skill - will be used by the client or a human
    as a hint to understand what the skill does.
    """
    examples: list[str] | None = None
    """
    The set of example scenarios that the skill can perform.
    Will be used by the client as a hint to understand how the skill can be used.
    """
    id: str
    """
    Unique identifier for the agent's skill.
    """
    inputModes: list[str] | None = None
    """
    The set of interaction modes that the skill supports
    (if different than the default).
    Supported mime types for input.
    """
    name: str
    """
    Human readable name of the skill.
    """
    outputModes: list[str] | None = None
    """
    Supported mime types for output.
    """
    tags: list[str]
    """
    Set of tagwords describing classes of capabilities for this specific skill.
    """

class AgentCapabilities(BaseModel):
    """
    Defines optional capabilities supported by an agent.
    """

    pushNotifications: bool | None = None
    """
    true if the agent can notify updates to client.
    """
    stateTransitionHistory: bool | None = None
    """
    true if the agent exposes status change history for tasks.
    """
    streaming: bool | None = None
    """
    true if the agent supports SSE.
    """


class AgentProvider(BaseModel):
    """
    Represents the service provider of an agent.
    """

    organization: str
    """
    Agent provider's organization name.
    """
    url: str
    """
    Agent provider's URL.
    """


class AgentCard(BaseModel):
    """
    An AgentCard conveys key information:
    - Overall details (version, name, description, uses)
    - Skills: A set of capabilities the agent can perform
    - Default modalities/content types supported by the agent.
    - Authentication requirements
    """

    capabilities: AgentCapabilities
    """
    Optional capabilities supported by the agent.
    """
    defaultInputModes: list[str]
    """
    The set of interaction modes that the agent supports across all skills. This can be overridden per-skill.
    Supported mime types for input.
    """
    defaultOutputModes: list[str]
    """
    Supported mime types for output.
    """
    description: str
    """
    A human-readable description of the agent. Used to assist users and
    other agents in understanding what the agent can do.
    """
    documentationUrl: str | None = None
    """
    A URL to documentation for the agent.
    """
    name: str
    """
    Human readable name of the agent.
    """
    provider: AgentProvider | None = None
    """
    The service provider of the agent
    """
    security: list[dict[str, list[str]]] | None = None
    """
    Security requirements for contacting the agent.
    """
    skills: list[AgentSkill]
    """
    Skills are a unit of capability that an agent can perform.
    """
    supportsAuthenticatedExtendedCard: bool | None = None
    """
    true if the agent supports providing an extended agent card when the user is authenticated.
    Defaults to false if not specified.
    """
    url: str
    """
    A URL to the address the agent is hosted at.
    """
    version: str
    """
    The version of the agent - format is up to the provider.
    """

