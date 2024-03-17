// https://github.com/openai/openai-node/blob/07b3504e1c40fd929f4aae1651b83afc19e3baf8/src/resources/chat/completions.ts#L146-L159
export interface FunctionCall {
  /**
   * The arguments to call the function with, as generated by the model in JSON
   * format. Note that the model does not always generate valid JSON, and may
   * hallucinate parameters not defined by your function schema. Validate the
   * arguments in your code before calling your function.
   */
  arguments?: string;

  /**
   * The name of the function to call.
   */
  name?: string;
}

/**
 * The tool calls generated by the model, such as function calls.
 */
export interface ToolCall {
  // The ID of the tool call.
  id: string;

  // The type of the tool. Currently, only `function` is supported.
  type: string;

  // The function that the model called.
  function: {
    // The name of the function.
    name: string;

    // The arguments to call the function with, as generated by the model in JSON
    arguments: string;
  };
}

/**
 * Controls which (if any) function is called by the model.
 * - none means the model will not call a function and instead generates a message.
 * - auto means the model can pick between generating a message or calling a function.
 * - Specifying a particular function via {"type: "function", "function": {"name": "my_function"}} forces the model to call that function.
 * none is the default when no functions are present. auto is the default if functions are present.
 */
export type ToolChoice =
  | 'none'
  | 'auto'
  | { type: 'function'; function: { name: string } };

/**
 * A list of tools the model may call. Currently, only functions are supported as a tool.
 * Use this to provide a list of functions the model may generate JSON inputs for.
 */
export interface Tool {
  type: 'function';
  function: Function;
}

export interface Function {
  /**
   * The name of the function to be called. Must be a-z, A-Z, 0-9, or contain
   * underscores and dashes, with a maximum length of 64.
   */
  name: string;

  /**
   * The parameters the functions accepts, described as a JSON Schema object. See the
   * [guide](/docs/guides/gpt/function-calling) for examples, and the
   * [JSON Schema reference](https://json-schema.org/understanding-json-schema/) for
   * documentation about the format.
   *
   * To describe a function that accepts no parameters, provide the value
   * `{"type": "object", "properties": {}}`.
   */
  parameters: Record<string, unknown>;

  /**
   * A description of what the function does, used by the model to choose when and
   * how to call the function.
   */
  description?: string;
}

export type IdGenerator = () => string;

/**
 * Shared types between the API and UI packages.
 */
export interface Message {
  id: string;
  tool_call_id?: string;
  createdAt?: Date;
  content: string;
  ui?: string | JSX.Element | JSX.Element[] | null | undefined;
  role: 'system' | 'user' | 'assistant' | 'function' | 'data' | 'tool';
  /**
   * If the message has a role of `function`, the `name` field is the name of the function.
   * Otherwise, the name field should not be set.
   */
  name?: string;
  /**
   * If the assistant role makes a function call, the `function_call` field
   * contains the function call name and arguments. Otherwise, the field should
   * not be set. (Deprecated and replaced by tool_calls.)
   */
  function_call?: string | FunctionCall;

  data?: JSONValue;
  /**
   * If the assistant role makes a tool call, the `tool_calls` field contains
   * the tool call name and arguments. Otherwise, the field should not be set.
   */
  tool_calls?: string | ToolCall[];

  /**
   * Additional message-specific information added on the server via StreamData
   */
  annotations?: JSONValue[] | undefined;

  /**
   * The iteration ID of the message.
   * Increment each time a user edits an existing message.
   */
  editId?: number;

  /**
   * The generation ID of the message.
   * Increment when a user asks for a new completion.
   */
  genId?: number;

  /**
   * The row ID of the message.
   * Set this after saving prompt to DB.
   * This is not a unique number, as one row saves the prompt and response.
   */
  rowid?: number;
}

export type CreateMessage = Omit<Message, 'id'> & {
  id?: Message['id'];
};

export type ChatRequest = {
  messages: Message[];
  options?: RequestOptions;
  // @deprecated
  functions?: Array<Function>;
  // @deprecated
  function_call?: FunctionCall;
  data?: Record<string, string>;
  tools?: Array<Tool>;
  tool_choice?: ToolChoice;
};

export type FunctionCallHandler = (
  chatMessages: Message[],
  functionCall: FunctionCall,
) => Promise<ChatRequest | void>;

export type ToolCallHandler = (
  chatMessages: Message[],
  toolCalls: ToolCall[],
) => Promise<ChatRequest | void>;

export type RequestOptions = {
  headers?: Record<string, string> | Headers;
  body?: object;
};

export type ChatRequestOptions = {
  options?: RequestOptions;
  functions?: Array<Function>;
  function_call?: FunctionCall;
  tools?: Array<Tool>;
  tool_choice?: ToolChoice;
  data?: Record<string, string>;
};

export type UseChatOptions = {
  /**
   * The API endpoint that accepts a `{ messages: Message[] }` object and returns
   * a stream of tokens of the AI chat response. Defaults to `/api/chat`.
   */
  api?: string;

  /**
   * The maximum number of messages to be sent to the API in a single request.
   */
  apiMessageCount?: number;

  /**
   * A unique identifier for the chat. If not provided, a random one will be
   * generated. When provided, the `useChat` hook with the same `id` will
   * have shared states across components.
   */
  id?: string;

  /**
   * Initial messages of the chat. Useful to load an existing chat history.
   */
  initialMessages?: Message[];

  /**
   * Initial input of the chat.
   */
  initialInput?: string;

  /**
   * Callback function to be called when a function call is received.
   * If the function returns a `ChatRequest` object, the request will be sent
   * automatically to the API and will be used to update the chat.
   */
  experimental_onFunctionCall?: FunctionCallHandler;

  /**
   * Callback function to be called when a tool call is received.
   * If the function returns a `ChatRequest` object, the request will be sent
   * automatically to the API and will be used to update the chat.
   */
  experimental_onToolCall?: ToolCallHandler;

  /**
   * Callback function to be called when the API response is received.
   */
  onResponse?: (response: Response) => void | Promise<void>;

  /**
   * Callback function to be called when the chat is finished streaming.
   */
  onFinish?: (message: Message) => void;

  /**
   * Callback function to be called when an error is encountered.
   */
  onError?: (error: Error) => void;

  /**
   * A way to provide a function that is going to be used for ids for messages.
   * If not provided nanoid is used by default.
   */
  generateId?: IdGenerator;

  /**
   * The credentials mode to be used for the fetch request.
   * Possible values are: 'omit', 'same-origin', 'include'.
   * Defaults to 'same-origin'.
   */
  credentials?: RequestCredentials;

  /**
   * HTTP headers to be sent with the API request.
   */
  headers?: Record<string, string> | Headers;

  /**
   * Extra body object to be sent with the API request.
   * @example
   * Send a `sessionId` to the API along with the messages.
   * ```js
   * useChat({
   *   body: {
   *     sessionId: '123',
   *   }
   * })
   * ```
   */
  body?: object;

  /**
   * Whether to send extra message fields such as `message.id` and `message.createdAt` to the API.
   * Defaults to `false`. When set to `true`, the API endpoint might need to
   * handle the extra fields before forwarding the request to the AI service.
   */
  sendExtraMessageFields?: boolean;
};

export type UseCompletionOptions = {
  /**
   * The API endpoint that accepts a `{ prompt: string }` object and returns
   * a stream of tokens of the AI completion response. Defaults to `/api/completion`.
   */
  api?: string;
  /**
   * An unique identifier for the chat. If not provided, a random one will be
   * generated. When provided, the `useChat` hook with the same `id` will
   * have shared states across components.
   */
  id?: string;

  /**
   * Initial prompt input of the completion.
   */
  initialInput?: string;

  /**
   * Initial completion result. Useful to load an existing history.
   */
  initialCompletion?: string;

  /**
   * Callback function to be called when the API response is received.
   */
  onResponse?: (response: Response) => void | Promise<void>;

  /**
   * Callback function to be called when the completion is finished streaming.
   */
  onFinish?: (prompt: string, completion: string) => void;

  /**
   * Callback function to be called when an error is encountered.
   */
  onError?: (error: Error) => void;

  /**
   * The credentials mode to be used for the fetch request.
   * Possible values are: 'omit', 'same-origin', 'include'.
   * Defaults to 'same-origin'.
   */
  credentials?: RequestCredentials;

  /**
   * HTTP headers to be sent with the API request.
   */
  headers?: Record<string, string> | Headers;

  /**
   * Extra body object to be sent with the API request.
   * @example
   * Send a `sessionId` to the API along with the prompt.
   * ```js
   * useChat({
   *   body: {
   *     sessionId: '123',
   *   }
   * })
   * ```
   */
  body?: object;
};

export type JSONValue =
  | null
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>;

export type AssistantMessage = {
  id: string;
  role: 'assistant';
  content: Array<{
    type: 'text';
    text: {
      value: string;
    };
  }>;
};

/*
 * A data message is an application-specific message from the assistant
 * that should be shown in order with the other messages.
 *
 * It can trigger other operations on the frontend, such as annotating
 * a map.
 */
export type DataMessage = {
  id?: string; // optional id, implement if needed (e.g. for persistance)
  role: 'data';
  data: JSONValue; // application-specific data
};
