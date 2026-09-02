// Live chat widget — replaces the old WhatsApp buttons for casual chat.
// Works for both guest visitors (via Supabase anonymous sign-in) and logged-in
// customers, using the same real-time chat_conversations/chat_messages tables
// admin.html reads from. Checkout still uses WhatsApp for now — this widget
// is for pre-purchase questions and support only.

let wwkChatConversationId = null;
let wwkChatChannel = null;
let wwkChatRenderedIds = new Set();

function wwkChatMount() {
  if (document.getElementById("chatFab")) return; // already mounted on this page

  const fab = document.createElement("button");
  fab.className = "chat-fab";
  fab.id = "chatFab";
  fab.setAttribute("aria-label", "Chat with WapeWape");
  fab.innerHTML = `
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
    <span class="chat-fab-badge" id="chatFabBadge" style="display:none;">1</span>
  `;

  const panel = document.createElement("div");
  panel.className = "chat-panel";
  panel.id = "chatPanel";
  panel.innerHTML = `
    <div class="chat-panel-header">
      <div><strong>Chat with WapeWape</strong><span>We usually reply within a few minutes</span></div>
      <button class="chat-panel-close" id="chatPanelClose" aria-label="Close chat">✕</button>
    </div>
    <div class="chat-messages" id="chatMessages">
      <p class="chat-msg-empty">Send us a message and we'll get back to you here.</p>
    </div>
    <div class="chat-input-row">
      <input type="text" id="chatInput" placeholder="Type a message…" maxlength="500">
      <button class="chat-send-btn" id="chatSendBtn" aria-label="Send message">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
      </button>
    </div>
  `;

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  fab.addEventListener("click", wwkChatToggle);
  document.getElementById("chatPanelClose").addEventListener("click", () => panel.classList.remove("open"));
  document.getElementById("chatSendBtn").addEventListener("click", wwkChatSend);
  document.getElementById("chatInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") wwkChatSend();
  });
}

async function wwkChatToggle() {
  const panel = document.getElementById("chatPanel");
  const opening = !panel.classList.contains("open");
  panel.classList.toggle("open");
  if (opening) await wwkChatOpen();
}

async function wwkChatOpen(prefillText) {
  wwkChatMount();
  const panel = document.getElementById("chatPanel");
  panel.classList.add("open");
  document.getElementById("chatFabBadge").style.display = "none";
  await wwkChatInit();
  const input = document.getElementById("chatInput");
  if (prefillText) input.value = prefillText;
  input.focus();
}

async function wwkChatInit() {
  if (wwkChatConversationId) return; // already set up on this page view

  let session = await wwkGetSession();
  if (!session) {
    const { data, error } = await sb.auth.signInAnonymously();
    if (error) {
      document.getElementById("chatMessages").innerHTML = `<p class="chat-msg-empty">Chat isn't available right now — please use WhatsApp or email instead.</p>`;
      return;
    }
    session = data.session;
  }

  const { data: existing } = await sb
    .from("chat_conversations")
    .select("id")
    .eq("customer_id", session.user.id)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    wwkChatConversationId = existing.id;
  } else {
    const { data: profile } = await wwkGetProfile(session.user.id);
    const { data: created, error } = await sb
      .from("chat_conversations")
      .insert({ customer_id: session.user.id, customer_name: profile?.full_name || null })
      .select("id")
      .single();
    if (error) return;
    wwkChatConversationId = created.id;
  }

  await wwkChatLoadHistory();
  wwkChatSubscribe();
}

async function wwkChatLoadHistory() {
  const { data } = await sb
    .from("chat_messages")
    .select("id, sender_type, message, created_at")
    .eq("conversation_id", wwkChatConversationId)
    .order("created_at", { ascending: true });

  const container = document.getElementById("chatMessages");
  if (!data || data.length === 0) {
    container.innerHTML = `<p class="chat-msg-empty">Send us a message and we'll get back to you here.</p>`;
    return;
  }
  container.innerHTML = "";
  data.forEach((m) => {
    wwkChatRenderedIds.add(m.id);
    wwkChatAppendMessage(m.sender_type, m.message);
  });
  container.scrollTop = container.scrollHeight;
}

function wwkChatAppendMessage(senderType, message) {
  const container = document.getElementById("chatMessages");
  const empty = container.querySelector(".chat-msg-empty");
  if (empty) empty.remove();
  const div = document.createElement("div");
  div.className = `chat-msg from-${senderType}`;
  div.textContent = message;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function wwkChatSubscribe() {
  if (wwkChatChannel) return;
  wwkChatChannel = sb
    .channel(`chat-${wwkChatConversationId}`)
    .on("postgres_changes", {
      event: "INSERT", schema: "public", table: "chat_messages",
      filter: `conversation_id=eq.${wwkChatConversationId}`
    }, (payload) => {
      const m = payload.new;
      if (wwkChatRenderedIds.has(m.id)) return;
      wwkChatRenderedIds.add(m.id);
      wwkChatAppendMessage(m.sender_type, m.message);
      if (m.sender_type === "admin" && !document.getElementById("chatPanel").classList.contains("open")) {
        document.getElementById("chatFabBadge").style.display = "flex";
      }
    })
    .subscribe();
}

async function wwkChatSend() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text || !wwkChatConversationId) return;
  const btn = document.getElementById("chatSendBtn");
  btn.disabled = true;
  input.value = "";

  const { error } = await sb.from("chat_messages").insert({
    conversation_id: wwkChatConversationId,
    sender_type: "customer",
    message: text
  });
  if (!error) {
    await sb.from("chat_conversations").update({ last_message_at: new Date().toISOString(), unread_by_admin: true }).eq("id", wwkChatConversationId);
  }
  btn.disabled = false;
}

document.addEventListener("DOMContentLoaded", wwkChatMount);
