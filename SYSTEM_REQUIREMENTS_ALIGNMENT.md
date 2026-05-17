# SmartDine BU System Requirements Alignment

This file notes how the submitted SmartDine BU requirements were applied in the implemented project.

## Chapter 1-3 Functional Requirements Applied

- Web-based smart canteen ordering system for the BU Polangui community
- Credential-based registration and login using BU email format
- Menu browsing with categories, item prices, images, and allergen information
- Online pre-ordering through cart and checkout
- Pickup schedule selection
- Queue/order status tracking: Order Received, Preparing, Ready for Pickup, Completed
- Staff/admin order management and status updates
- COD and GCash payment options
- AI/NLP chatbot for menu details, ordering procedures, queue/status questions, payment questions, allergens, feedback, and complaints
- Single floating NLP chatbot interface to avoid duplicate chatbot screens
- Mobile and desktop accessible interface
- ISO/IEC 25010-oriented focus on usability, performance, and reliability

## Hardware Requirements Applied

- Supported devices: smartphones, tablets, laptops, and desktops
- Minimum mobile memory target: 2 GB RAM
- Minimum desktop/laptop target: 4 GB RAM and 1 GHz processor
- Storage: enough local storage for cached browser data and prototype records
- Network: at least 5 Mbps connection, with 10 Mbps recommended for smoother menu, queue, and chatbot updates

## Software Requirements Applied

- Operating systems: Android 8+, iOS 12+, Windows 10+, macOS 10.13+
- Browsers: Google Chrome, Mozilla Firefox, Safari, and Microsoft Edge
- JavaScript must be enabled
- Browser storage must be enabled for temporary cart and UI state
- Microphone permission is required for voice-to-text
- Speech synthesis support is required for text-to-speech

## Development Tools Applied

| Requirement From Chapter 1-3 | Applied In This System |
| --- | --- |
| React frontend | React app with Vite |
| Node.js backend/runtime | Node.js/Vite runtime deployed on Vercel |
| Express backend | The project uses Node.js/Vite with Supabase services instead of a separate Express server for this prototype |
| Database/chatbot knowledge base | Supabase PostgreSQL |
| MongoDB/MySQL note | Supabase PostgreSQL is used as the actual database for the deployed system |
| PayMongo/GCash | COD and GCash proof-of-payment upload are the implemented payment options |
| Figma | UI prototype/reference source |
| VS Code | Compatible project structure for development |
| GitHub | Source code hosting and collaboration |
| Vercel/Render hosting | Vercel deployment supported through `vercel.json` |
| AI chatbot | Local NLP module and Web Speech API |

## NLP Project Requirements Applied

- User input through text field and voice button
- NLP processing module in `src/app/utils/nlp.ts`
- Tokenization output
- Sentiment analysis output
- Keyword extraction output
- Text classification/intent output
- Entity recognition for food, category, and allergen mentions
- Chatbot conversation interface
- Conversation history storage in Supabase through `nlp_chat_messages`
- Text-to-speech Speak button
- Functional navigation through the main app routes
- Database export in `database/smartdine_supabase_schema.sql`

## Implementation Decision

The Chapter 3 table mentioned MongoDB, and the NLP instruction also mentioned MySQL as a recommended option. In the implemented system, I used Supabase PostgreSQL because it fits the deployed Vercel setup and already supports the needed database tables, authentication, API access, and chat history storage. The payment part is limited to COD and GCash proof-of-payment upload, and the Figma file is used as the UI prototype/reference for the React interface.
