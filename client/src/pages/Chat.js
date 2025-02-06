import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { SERVER_URL, CONVERSATIONS_URL, IMAGES_URL } from "../config/config";
import { useAuth } from "../hooks/useAuth";
import { axiosPrivate } from "../api/axios";

const socket = io(SERVER_URL, {
    withCredentials: true,
});


const Chat = () => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [receiver, setReceiver] = useState(null);
    const [conversations, setConversations] = useState([]);
    const { user, refreshTokens } = useAuth();
    const { conversationId } = useParams();

    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages]);

    useEffect(() => {
        getConversations();
        getMessages();

        socket.on("connect_error", (error) => {
            console.log(error.message);
            if (error.message === "Unauthorized") {
                refreshTokens();
            }
        });

        socket.on("private message", (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        return () => {
            socket.off("receiveMessage");
        };
    }, []);

    const getMessages = async () => {
        try {
            const res = await axiosPrivate.get(CONVERSATIONS_URL + `/${conversationId}/messages`)

            for (let x of res.data.data.conversation.convParticipants) {
                if (x.userId !== user.id) {
                    setReceiver(x.user);
                }
            }
            setMessages(res.data.data.conversation.messages);
        } catch (error) {
            console.error(error);
        }
    };

    const sendMessage = () => {
        try {
            if (message.trim()) {
                const messageData = {
                    senderId: user.id,
                    conversationId: Number(conversationId),
                    receiverId: receiver.id,
                    content: message,
                };

                socket.emit("private message", messageData);
                setMessages(prevMessages => [...prevMessages, messageData]);
                setMessage("");
            }
        } catch (error) {
            console.error(error);

        }
    };

    const getConversations = async () => {
        try {
            const res = await axiosPrivate.get(CONVERSATIONS_URL);
            console.log(res.data.data.conversations);

            setConversations(res.data.data.conversations);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="py-4 flex bg-neutral-100 h-full">
            <div className="rounded mx-4 flex flex-col justify-between">
                <div className="rounded-lg p-3 flex align-middle bg-neutral-200">
                    <span className="material-symbols-outlined text-xl">chat_bubble</span>
                </div>
                <div className="hover:bg-gray-100 cursor-pointer" onClick={() => { alert("Clicked") }}>
                    <img className="inline-block size-10 rounded-full " src={`${IMAGES_URL}/${user?.avatar}`} alt="" />
                </div>
            </div>
            <div className="rounded-lg p-3 bg-white me-4 w-1/5">
                <h1 className="text-2xl font-bold">Chats</h1>
                <div className="flex flex-col">
                    {conversations.map((conv) => {          
                        const user = conv.conversation.convParticipants[0].user;
                        const message = conv.conversation.messages[0];

                        return (
                            <div key={conv.conversationId} className="py-2 flex items-center cursor-pointer hover:bg-gray-100">
                                <div>
                                    <img  className="inline-block size-10 rounded-full ring-2 ring-0" src={`${IMAGES_URL}/${user.avatar}`} alt="" />
                                </div>
                                <div className="flex flex-col ms-2">
                                    <span className="text-base font-bold">{user.firstName + " " + user.lastName}</span>
                                    <span className="text-sm text-gray-500">{message ? message.content : "No message yet" }</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className="rounded-lg bg-white w-4/5 me-4 flex flex-col">
                <div className="flex justify-between p-3 shadow-md">
                    <div className="flex">
                        <div>
                            <img className="inline-block size-10 rounded-full ring-2 ring-0" src={`${IMAGES_URL}/${receiver?.avatar}`} alt="" />
                        </div>
                        <div className="flex flex-col ms-2">
                            <span className="text-base font-bold">John Doe</span>
                            <span className="text-sm text-gray-500">Active now</span>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className="material-symbols-outlined text-blue-500">more_horiz</span>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto flex flex-col pb-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex w-full p-2 ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}>
                            <div className="flex max-w-md">
                                {msg.senderId !== user.id && (
                                    <div className="flex pe-2 items-end">
                                        <img className="size-8 rounded-full" src={`${IMAGES_URL}/${receiver?.avatar}`} alt="" />
                                    </div>
                                )}
                                <p className={`rounded-3xl px-3 py-2 break-words max-w-full text-sm 
                                    ${msg.senderId === user.id ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white" : "bg-gray-100 text-black"}`
                                }>
                                    {msg.content}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <div className="flex p-1 items-center mb-2">
                    <button className="p-2 w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full active:bg-gray-200">
                        <span className="material-symbols-outlined text-blue-500 text-2xl">
                            add_circle
                        </span>
                    </button>
                    <button className="p-2 w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full active:bg-gray-200">
                        <span className="material-symbols-outlined text-blue-500 text-2xl">
                            imagesmode
                        </span>
                    </button>
                    <button className="p-2 w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full active:bg-gray-200">
                        <span className="material-symbols-outlined text-blue-500 text-2xl">
                            gif_box
                        </span>
                    </button>
                    <input
                        type="text"
                        className="flex-grow ms-2 bg-gray-100 px-3 py-2 rounded-3xl focus:outline-none caret-blue-500 me-2"
                        placeholder="Aa"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                sendMessage();
                            }
                        }}
                    />
                    <button
                        className="p-2 w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full active:bg-gray-200"
                    >
                        <span className="material-symbols-outlined text-blue-500 text-2xl">
                            thumb_up
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
