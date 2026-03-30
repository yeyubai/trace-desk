import { NextResponse } from "next/server";
import { getWorkbenchSnapshot } from "@/features/workbench/server/getWorkbenchSnapshot";

export async function GET() {
  return NextResponse.json(await getWorkbenchSnapshot());
}
