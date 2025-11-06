#!/bin/bash
cd server && npm run dev &
SERVER_PID=$!
cd .. && npm run dev &
FRONTEND_PID=$!

wait $SERVER_PID $FRONTEND_PID
