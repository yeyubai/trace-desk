type ResponseParser<TData> = (input: unknown) => TData;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseErrorResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const data = (await response.json()) as { message?: string };
    return new ApiError(
      data.message ?? `Request failed with status ${response.status}`,
      response.status,
    );
  }

  const text = await response.text();

  return new ApiError(
    text.trim() || `Request failed with status ${response.status}`,
    response.status,
  );
}

export async function getJson<TData>(
  input: string,
  parser?: ResponseParser<TData>,
): Promise<TData> {
  const response = await fetch(input, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  const data = await response.json();

  return parser ? parser(data) : (data as TData);
}

export async function postJson<TData, TInput>(
  input: string,
  body: TInput,
  parser?: ResponseParser<TData>,
): Promise<TData> {
  const response = await fetch(input, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  const data = await response.json();

  return parser ? parser(data) : (data as TData);
}

export async function postFormData<TData>(
  input: string,
  body: FormData,
  parser?: ResponseParser<TData>,
): Promise<TData> {
  const response = await fetch(input, {
    method: "POST",
    body,
  });

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  const data = await response.json();

  return parser ? parser(data) : (data as TData);
}
