import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Message from "@/models/Message";

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const pending = searchParams.get("pending");
  const filter = pending === "true" ? { approved: false } : { approved: true };
  const messages = await Message.find(filter).sort({ createdAt: -1 });
  return NextResponse.json(messages);
}

export async function POST(request) {
  await dbConnect();
  const data = await request.json();
  const message = await Message.create({ ...data, approved: false });
  return NextResponse.json(message, { status: 201 });
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const data = await request.json();
  const { _id, ...updateData } = data;
  const message = await Message.findByIdAndUpdate(_id, updateData, { new: true });
  return NextResponse.json(message);
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  await Message.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
