export async function getJson<TData>(input: string): Promise<TData> {
  const response = await fetch(input, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as TData;
}

export async function postJson<TData, TInput>(
  input: string,
  body: TInput,
): Promise<TData> {
  const response = await fetch(input, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as TData;
}

export async function postFormData<TData>(
  input: string,
  body: FormData,
): Promise<TData> {
  const response = await fetch(input, {
    method: "POST",
    body,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as TData;
}
