import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Batchmate from "@/models/Batchmate";

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { specialization: { $regex: search, $options: "i" } },
    ];
  }
  const batchmates = await Batchmate.find(filter).sort({ name: 1 });
  return NextResponse.json(batchmates);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const data = await request.json();
  const batchmate = await Batchmate.create(data);
  return NextResponse.json(batchmate, { status: 201 });
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const data = await request.json();
  const { _id, ...updateData } = data;
  const batchmate = await Batchmate.findByIdAndUpdate(_id, updateData, { new: true });
  return NextResponse.json(batchmate);
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  await Batchmate.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
