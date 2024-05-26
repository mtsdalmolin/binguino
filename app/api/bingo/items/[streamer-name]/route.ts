import { db } from "@/lib/drizzle/db";
import { selectedBingoItems, streamerBingosItems } from "@/lib/drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

type Context = {
  params: {
    [key: string]: string;
  };
};

export async function GET(_: NextRequest, context: Context) {
  const streamerName = context.params["streamer-name"];
  const streamerItems = await db
    .select({
      id: streamerBingosItems.id,
      name: streamerBingosItems.name,
      marked: selectedBingoItems.marked,
    })
    .from(streamerBingosItems)
    .leftJoin(
      selectedBingoItems,
      eq(selectedBingoItems.bingoItemId, streamerBingosItems.id)
    )
    .where(eq(streamerBingosItems.streamer, streamerName))
    .orderBy(desc(streamerBingosItems.id));

  return NextResponse.json(streamerItems, { status: 200 });
}

export async function POST(request: NextRequest, context: Context) {
  const streamerName = context.params["streamer-name"];
  const requestBody = await request.json();
  const { itemName } = requestBody;

  try {
    await db
      .insert(streamerBingosItems)
      .values({ name: itemName, streamer: streamerName });
    return NextResponse.json({}, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(err.detail, { status: 422 });
  }
}

export async function PATCH(request: NextRequest) {
  const requestBody = await request.json();
  const { bingoId, itemId, marked } = requestBody;

  try {
    await db
      .insert(selectedBingoItems)
      .values({ bingoId, bingoItemId: itemId, marked })
      .onConflictDoUpdate({
        target: [selectedBingoItems.bingoId, selectedBingoItems.bingoItemId],
        set: { marked },
      });

    return NextResponse.json({}, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(err.detail, { status: 422 });
  }
}

export async function DELETE(request: NextRequest) {
  const requestBody = await request.json();
  const { itemId } = requestBody;

  try {
    await db
      .delete(streamerBingosItems)
      .where(eq(streamerBingosItems.id, itemId));

    return NextResponse.json({}, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(err.detail, { status: 422 });
  }
}