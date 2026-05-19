import { useEffect, useMemo, useRef, useState } from "react";

import API from "../service/api";

import socket from "../service/socket";


const EMOJIS = ["😀", "😂", "😍", "😎", "👍", "🔥", "🎉", "❤️"];


function Chat() {

    const storedUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch {
            return null;
        }
    }, []);

    const currentUser =
        storedUser?.name ||
        localStorage.getItem("userName") ||
        "You";

    const currentUserId = storedUser?.userId || "";

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [activeUser, setActiveUser] = useState(null);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [chats, setChats] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [loadingChats, setLoadingChats] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUser, setTypingUser] = useState("");
    const [unreadCounts, setUnreadCounts] = useState({});
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);


    const mergeChats = (primaryChats, fallbackChats = []) => {
        const chatMap = new Map();

        [...fallbackChats, ...primaryChats].forEach((chat) => {
            if (chat?.chatId) {
                chatMap.set(chat.chatId, chat);
            }
        });

        return Array.from(chatMap.values()).sort((a, b) =>
            new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
        );
    };


    const getChatUser = (chat) =>
        (
            chat?.chatId === activeChat?.chatId
                ? activeUser
                : null
        ) ||
        chat?.otherUser ||
        chat?.participants?.find(
            (participant) =>
                participant?.userId &&
                participant.userId !== currentUserId
        ) ||
        allUsers.find((user) =>
            chat?.chatId?.includes(user.userId)
        );


    const getLastMessagePreview = (chat) => {
        if (!chat?.lastMessage) {
            return `@${getChatUser(chat)?.userId || ""}`;
        }

        if (chat.lastMessageSenderUserId === currentUserId) {
            return `You: ${chat.lastMessage}`;
        }

        return chat.lastMessage;
    };


    const formatTime = (dateValue) => {
        if (!dateValue) {
            return "";
        }

        return new Date(dateValue).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    };


    const isOnline = (userId) =>
        onlineUsers.includes(userId);


    const playNotification = () => {
        try {
            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;
            const context = new AudioContext();
            const oscillator = context.createOscillator();
            const gain = context.createGain();

            oscillator.type = "sine";
            oscillator.frequency.value = 720;
            gain.gain.value = 0.05;
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.start();
            oscillator.stop(context.currentTime + 0.12);
        } catch {
            // Browser audio can be blocked until the user interacts.
        }
    };


    const upsertChat = (chat) => {
        if (!chat?.chatId) {
            return;
        }

        setChats((prev) =>
            mergeChats([chat], prev)
        );
    };


    const loadChats = async () => {
        try {
            setLoadingChats(true);

            const res = await API.get("/chats");

            setChats((prev) =>
                mergeChats(res.data, prev)
            );

            const savedChatId = localStorage.getItem("activeChatId");

            if (!activeChat && savedChatId) {
                const savedChat = res.data.find(
                    (chat) => chat.chatId === savedChatId
                );

                if (savedChat) {
                    setActiveChat(savedChat);
                    setActiveUser(savedChat.otherUser);
                }
            }
        } catch (error) {
            console.log(error);
            setChats([]);
        } finally {
            setLoadingChats(false);
        }
    };


    const loadUsers = async () => {
        try {
            setIsSearching(true);

            const res = await API.get("/users");

            setAllUsers(res.data);
            setSearchResult(res.data);
        } catch (error) {
            console.log(error);
            setSearchResult([]);
        }
    };


    const searchUsers = async (value) => {
        setSearch(value);

        if (!value.trim()) {
            loadUsers();
            return;
        }

        try {
            const res = await API.get(
                `/users/search/${value.trim()}`
            );

            setSearchResult(
                Array.isArray(res.data) ? res.data : [res.data]
            );
        } catch (error) {
            console.log(error);
            setSearchResult([]);
        }
    };


    const openPrivateChat = async (user) => {
        try {
            const chatRes = await API.post(
                "/chats/private",
                {
                    receiverUserId: user.userId
                }
            );

            const chat = {
                ...chatRes.data,
                otherUser: chatRes.data.otherUser || user
            };

            setActiveChat(chat);
            setActiveUser(chat.otherUser);
            upsertChat(chat);
            setUnreadCounts((prev) => ({
                ...prev,
                [chat.chatId]: 0
            }));
            localStorage.setItem("activeChatId", chat.chatId);
            setSearch("");
            setSearchResult([]);
            setIsSearching(false);
            loadChats();
        } catch (error) {
            console.log(error);
        }
    };


    const openExistingChat = (chat) => {
        setActiveChat(chat);
        setActiveUser(getChatUser(chat));
        setUnreadCounts((prev) => ({
            ...prev,
            [chat.chatId]: 0
        }));
        localStorage.setItem("activeChatId", chat.chatId);
        setSearch("");
        setSearchResult([]);
        setIsSearching(false);
    };


    const emitTyping = (isTyping) => {
        if (!activeChat?.chatId || !activeUser?.userId) {
            return;
        }

        socket.emit("typing", {
            chatId: activeChat.chatId,
            receiverUserId: activeUser.userId,
            senderUserId: currentUserId,
            senderName: currentUser,
            isTyping
        });
    };


    const handleMessageChange = (value) => {
        setMessage(value);
        emitTyping(true);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            emitTyping(false);
        }, 900);
    };


    const addEmoji = (emoji) => {
        handleMessageChange(`${message}${emoji}`);
        setShowEmojiPicker(false);
    };


    const sendMessage = async () => {
        const text = message.trim();

        if (!text || !activeChat?.chatId) {
            return;
        }

        try {
            emitTyping(false);

            const res = await API.post(
                "/messages",
                {
                    chatId: activeChat.chatId,
                    message: text
                }
            );

            socket.emit("sendMessage", res.data);

            upsertChat({
                ...activeChat,
                ...res.data.chat,
                otherUser: getChatUser(activeChat),
                lastMessage: res.data.text || res.data.message,
                lastMessageSenderUserId: res.data.senderUserId,
                updatedAt: res.data.createdAt
            });

            setMessage("");
            setShowEmojiPicker(false);
            loadChats();
        } catch (error) {
            console.log(error);
        }
    };


    const visibleChats = mergeChats(
        activeChat
            ? [
                {
                    ...activeChat,
                    otherUser: getChatUser(activeChat)
                }
            ]
            : [],
        chats
    );


    useEffect(() => {
        const registerUser = () => {
            if (currentUserId) {
                socket.emit("registerUser", currentUserId);
            }
        };

        registerUser();
        socket.on("connect", registerUser);
        socket.on("onlineUsers", setOnlineUsers);
        loadChats();

        return () => {
            socket.off("connect", registerUser);
            socket.off("onlineUsers", setOnlineUsers);
        };
    }, [currentUserId]);


    useEffect(() => {
        if (!activeChat?.chatId) {
            return undefined;
        }

        const loadMessages = async () => {
            try {
                setLoadingMessages(true);

                const res = await API.get(
                    `/messages/${activeChat.chatId}`
                );

                setMessages(res.data);
            } catch (error) {
                console.log(error);
                setMessages([]);
            } finally {
                setLoadingMessages(false);
            }
        };

        socket.emit("joinChat", activeChat.chatId);
        setUnreadCounts((prev) => ({
            ...prev,
            [activeChat.chatId]: 0
        }));
        loadMessages();

        return () => {
            socket.emit("leaveChat", activeChat.chatId);
        };
    }, [activeChat?.chatId]);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages, typingUser]);


    useEffect(() => {
        const handleMessage = (newMessage) => {
            const incomingChat = newMessage.chat;
            const isCurrentChat =
                newMessage.chatId === activeChat?.chatId;
            const isOwnMessage =
                newMessage.senderUserId === currentUserId;

            if (incomingChat) {
                upsertChat({
                    ...incomingChat,
                    otherUser: getChatUser(incomingChat),
                    lastMessage: newMessage.text || newMessage.message,
                    lastMessageSenderUserId: newMessage.senderUserId,
                    updatedAt: newMessage.createdAt
                });
            } else {
                loadChats();
            }

            if (!isCurrentChat && !isOwnMessage) {
                setUnreadCounts((prev) => ({
                    ...prev,
                    [newMessage.chatId]:
                        (prev[newMessage.chatId] || 0) + 1
                }));
                playNotification();
                return;
            }

            if (!isCurrentChat) {
                return;
            }

            if (!isOwnMessage) {
                playNotification();
            }

            setMessages((prev) => {
                if (
                    newMessage._id &&
                    prev.some((msg) => msg._id === newMessage._id)
                ) {
                    return prev;
                }

                return [...prev, newMessage];
            });
        };

        const handleTyping = (data) => {
            if (
                data.chatId !== activeChat?.chatId ||
                data.senderUserId === currentUserId
            ) {
                return;
            }

            setTypingUser(data.isTyping ? data.senderName : "");
        };

        socket.on("receiveMessage", handleMessage);
        socket.on("typing", handleTyping);

        return () => {
            socket.off("receiveMessage", handleMessage);
            socket.off("typing", handleTyping);
        };
    }, [activeChat?.chatId, currentUserId, activeUser, allUsers]);


    return (
        <div className="chat-page rtca-root">
            <div className="sidebar">
                <div className="sidebar-top">
                    <h2>Pulse</h2>

                    <div className="current-profile">
                        <div className="avatar online"></div>

                        <div>
                            <h3>{currentUser}</h3>
                            <p>@{currentUserId}</p>
                        </div>
                    </div>

                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onFocus={loadUsers}
                        onClick={loadUsers}
                        onChange={(e) =>
                            searchUsers(e.target.value)
                        }
                    />
                </div>

                <div className="chat-users">
                    {
                        isSearching && searchResult.map((user) => (
                            <button
                                key={user._id}
                                className={
                                    activeUser?.userId === user.userId
                                        ? "chat-user active"
                                        : "chat-user"
                                }
                                onClick={() =>
                                    openPrivateChat(user)
                                }
                                type="button"
                            >
                                <div
                                    className={
                                        isOnline(user.userId)
                                            ? "avatar online"
                                            : "avatar offline"
                                    }
                                ></div>

                                <div className="chat-user-text">
                                    <h4>{user.name}</h4>
                                    <p>
                                        {
                                            isOnline(user.userId)
                                                ? "Online"
                                                : "Offline"
                                        }
                                    </p>
                                </div>
                            </button>
                        ))
                    }

                    {
                        isSearching && searchResult.length === 0 && (
                            <div className="empty-sidebar">
                                No users found
                            </div>
                        )
                    }

                    {
                        !isSearching && (
                            <>
                                <div className="sidebar-section-title">
                                    Chats ({visibleChats.length})
                                </div>

                                {
                                    loadingChats && visibleChats.length === 0 && (
                                        <div className="sidebar-skeleton-list">
                                            <div className="sidebar-skeleton"></div>
                                            <div className="sidebar-skeleton"></div>
                                            <div className="sidebar-skeleton"></div>
                                        </div>
                                    )
                                }

                                {
                                    visibleChats.map((chat) => {
                                        const user = getChatUser(chat);
                                        const unread =
                                            unreadCounts[chat.chatId] || 0;

                                        return (
                                            <button
                                                key={chat._id || chat.chatId}
                                                className={
                                                    activeChat?.chatId === chat.chatId
                                                        ? "chat-user active"
                                                        : "chat-user"
                                                }
                                                onClick={() =>
                                                    openExistingChat(chat)
                                                }
                                                type="button"
                                            >
                                                <div
                                                    className={
                                                        isOnline(user?.userId)
                                                            ? "avatar online"
                                                            : "avatar offline"
                                                    }
                                                ></div>

                                                <div className="chat-user-text">
                                                    <h4>
                                                        {
                                                            user?.name ||
                                                            "Unknown user"
                                                        }
                                                    </h4>

                                                    <p>
                                                        {
                                                            getLastMessagePreview(chat)
                                                        }
                                                    </p>
                                                </div>

                                                {
                                                    unread > 0 && (
                                                        <span className="unread-badge">
                                                            {unread}
                                                        </span>
                                                    )
                                                }
                                            </button>
                                        );
                                    })
                                }

                                {
                                    !loadingChats && visibleChats.length === 0 && (
                                        <div className="empty-sidebar">
                                            No chats yet
                                        </div>
                                    )
                                }
                            </>
                        )
                    }
                </div>
            </div>

            <div className="chat-area rtca-chat-section">
                {
                    activeUser && (
                        <div className="chat-header rtca-header">
                            <div className="chat-user-info">
                                <div
                                    className={
                                        isOnline(activeUser.userId)
                                            ? "avatar online"
                                            : "avatar offline"
                                    }
                                ></div>

                                <div>
                                    <h3>{activeUser.name}</h3>
                                    <p>
                                        {
                                            isOnline(activeUser.userId)
                                                ? "Online"
                                                : "Offline"
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                }

                <div className="messages rtca-messages-wrapper">
                    <div className="messages-inner rtca-messages-inner">
                        <div className="messages-content rtca-messages-content">
                    {
                        (!activeChat || messages.length === 0) && !loadingMessages && (
                            <div className="chat-welcome">
                                <div className="welcome-logo">
                                    P
                                </div>

                                <h2>
                                    {
                                        activeChat
                                            ? "No messages yet"
                                            : "Pulse"
                                    }
                                </h2>
                            </div>
                        )
                    }

                    {
                        loadingMessages && (
                            <div className="message-skeleton-list">
                                <div className="message-skeleton received"></div>
                                <div className="message-skeleton sent"></div>
                                <div className="message-skeleton received small"></div>
                            </div>
                        )
                    }

                    {
                        !loadingMessages && messages.map((msg) => {
                            const isSent =
                                msg.sender === currentUser ||
                                msg.senderUserId === currentUserId;

                            return (
                                <div
                                    key={
                                        msg._id ||
                                        `${msg.chatId}-${msg.createdAt}`
                                    }
                                    className={
                                        isSent
                                            ? "message-row sent-row"
                                            : "message-row received-row"
                                    }
                                >
                                    <div
                                        className={
                                            isSent
                                                ? "message sent"
                                                : "message received"
                                        }
                                    >
                                        <div className="message-content">
                                            <span className="sender-name">
                                                {
                                                    isSent
                                                        ? "You"
                                                        : msg.sender
                                                }
                                            </span>

                                            <p>
                                                {msg.text || msg.message}
                                            </p>

                                            <span className="message-time">
                                                {formatTime(msg.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    }

                        {
                            typingUser && (
                                <div className="typing-indicator">
                                    {typingUser} is typing...
                                </div>
                            )
                        }

                        <div ref={messagesEndRef}></div>
                        </div>
                    </div>
                </div>

                <div className="message-input rtca-input">
                    {
                        showEmojiPicker && (
                            <div className="emoji-picker">
                                {
                                    EMOJIS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() =>
                                                addEmoji(emoji)
                                            }
                                        >
                                            {emoji}
                                        </button>
                                    ))
                                }
                            </div>
                        )
                    }

                    <button
                        className="emoji-toggle"
                        type="button"
                        disabled={!activeChat}
                        onClick={() =>
                            setShowEmojiPicker((value) => !value)
                        }
                    >
                        ☺
                    </button>

                    <input
                        type="text"
                        placeholder={
                            activeChat
                                ? "Type a message..."
                                : "Select a user first..."
                        }
                        value={message}
                        disabled={!activeChat}
                        onChange={(e) =>
                            handleMessageChange(e.target.value)
                        }
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                    />

                    <button
                        className="send-button"
                        onClick={sendMessage}
                        disabled={!activeChat}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Chat;
