
from enum import Enum
from typing import Any, Literal
import uuid
from pydantic import BaseModel

class Role(Enum):
    """
    Message sender's role
    """

    agent = 'agent'
    user = 'user'
class Message(BaseModel):
    """
    Represents a single message exchanged between user and agent.
    """

    contextId: str | None = None
    """
    The context the message is associated with
    """
    kind: Literal['message'] = 'message'
    """
    Event type
    """
    messageId: str
    """
    Identifier created by the message creator
    """
    metadata: dict[str, Any] | None = None
    """
    Extension metadata.
    """
    referenceTaskIds: list[str] | None = None
    """
    List of tasks referenced as context by this message.
    """
    role: Role
    """
    Message sender's role
    """
    taskId: str | None = None
    """
    Identifier of task the message is related to
    """
class TaskState(Enum):
    """
    Represents the possible states of a Task.
    """

    submitted = 'submitted'
    working = 'working'
    input_required = 'input-required'
    completed = 'completed'
    canceled = 'canceled'
    failed = 'failed'
    rejected = 'rejected'
    auth_required = 'auth-required'
    unknown = 'unknown'
    
class TaskStatus(BaseModel):
    """
    TaskState and accompanying message.
    """

    message: Message | None = None
    """
    Additional status updates for client
    """
    state: TaskState
    timestamp: str | None = None
    """
    ISO 8601 datetime string when the status was recorded.
    """

class Task(BaseModel):
    contextId: str
    """
    Server-generated id for contextual alignment across interactions
    """
    history: list[Message] | None = None
    id: str
    """
    Unique identifier for the task
    """
    kind: Literal['task'] = 'task'
    """
    Event type
    """
    metadata: dict[str, Any] | None = None
    """
    Extension metadata.
    """
    status: TaskStatus
    """
    Current status of the task
    """

class Utility:
    def __init__(self):
        pass
    
    def new_task(self,request: Message) -> Task:
        """Creates a new Task object from an initial user message.

        Generates task and context IDs if not provided in the message.

        Args:
            request: The initial `Message` object from the user.

        Returns:
            A new `Task` object initialized with 'submitted' status and the input message in history.
        """
        return Task(
            status=TaskStatus(state=TaskState.submitted),
            id=(request.taskId if request.taskId else str(uuid.uuid4())),
            contextId=(
                request.contextId if request.contextId else str(uuid.uuid4())
            ),
            history=[request],
        )


    def completed_task(
        self,
        task_id: str,
        context_id: str,
        history: list[Message] | None = None,
    ) -> Task:
        """Creates a Task object in the 'completed' state.

        Useful for constructing a final Task representation when the agent
        finishes and produces artifacts.

        Args:
            task_id: The ID of the task.
            context_id: The context ID of the task.
            artifacts: A list of `Artifact` objects produced by the task.
            history: An optional list of `Message` objects representing the task history.

        Returns:
            A `Task` object with status set to 'completed'.
        """
        if history is None:
            history = []
        return Task(
            status=TaskStatus(state=TaskState.completed),
            id=task_id,
            contextId=context_id,
            history=history,
        )
