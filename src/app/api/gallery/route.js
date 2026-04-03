import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Media from "@/models/Media";
import Event from "@/models/Event";
import Like from "@/models/Like";

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const tag = searchParams.get("tag");
  const type = searchParams.get("type"); // Not applicable to events mostly, but we'll try
  
  const filter = {};
  if (year) filter.year = parseInt(year);
  if (tag) filter.tags = { $in: [tag] }; // Gallery uses tags
  if (type) filter.type = type;

  // Get regular gallery media
  const galleryItems = await Media.find(filter).lean();

  // For timeline events: check how they match filters
  // Event doesn't have tags, it has title / category. We can match tag against those loosely if needed,
  // but for simplicity, we just filter by year maybe.
  const eventFilter = {};
  if (year) eventFilter.year = parseInt(year);
  if (tag) eventFilter.title = { $regex: tag, $options: "i" }; // fall back to title search for events
  
  let eventItems = [];
  try {
    const events = await Event.find(eventFilter).lean();
    eventItems = events.flatMap(event => 
      (event.photos || []).map((photo, index) => {
        const isVideo = photo.url.includes('/video/') || photo.url.match(/\.(mp4|webm|ogg)$/i);
        // Only include if it matches type filter
        if (type && type !== (isVideo ? "video" : "image")) return null;
        
        return {
          _id: `${event._id}-media-${index}`,
          type: isVideo ? "video" : "image",
          url: photo.url,
          thumbnail: isVideo ? photo.url.replace(/\.[^/.]+$/, ".jpg") : null,
          title: `${event.title}`,
          eventName: event.title,
          caption: event.description,
          year: event.year,
          createdAt: event.date || event.createdAt || new Date()
        };
      }).filter(Boolean)
    );
  } catch (e) {
    console.error("Error fetching event photos for gallery", e);
  }

  const merged = [...galleryItems, ...eventItems].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  try {
    const likesData = await Like.aggregate([{ $group: { _id: "$targetId", count: { $sum: 1 } } }]);
    const likesMap = {};
    likesData.forEach(l => likesMap[l._id] = l.count);
    
    merged.forEach(item => {
      item.likesCount = likesMap[item._id] || 0;
    });
  } catch (e) {
    console.error("Error fetching likes for gallery", e);
  }

  return NextResponse.json(merged);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const data = await request.json();
  const media = await Media.create(data);
  return NextResponse.json(media, { status: 201 });
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  await Media.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
