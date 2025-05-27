Certainly! Below is the updated `README.md` file for your AI-powered disaster response coordination platform. This version integrates both the Agent-to-Agent (A2A) protocol and the Model Context Protocol (MCP), leveraging free MCP servers like Brave Browser MCP to enhance functionality.

---

# 🌐 AI-Powered Disaster Response Coordination Platform

## 🚀 Overview

This platform leverages LangGraph, the Agent-to-Agent (A2A) protocol, and the Model Context Protocol (MCP) to automate disaster management processes. It intelligently processes user requests through a multi-agent system capable of analyzing text, images, and voice inputs. The system verifies the legitimacy of requests, allocates resources based on location and availability, and provides real-time assistance through AI agents. Integration with free MCP servers, such as Brave Browser MCP, enhances the platform's capabilities by enabling secure access to external tools and data sources.

## 🧠 Core Features

* **Multimodal Request Processing**: Handles user inputs in text, image, and voice formats.
* **Request Verification**: Ensures legitimacy by checking for multiple requests within a 5km radius.
* **Resource Allocation**: Dynamically assigns available resources (e.g., army personnel, volunteers, hospitals) based on verified requests.
* **Consolation Bot**: Offers tips and emotional support to users in panic situations.
* **Web Search & RAG Integration**: Agents can perform web searches and retrieve information from reports to provide context-aware responses.
* **MCP Integration**: Utilizes free MCP servers like Brave Browser MCP to access external tools and data sources.
* **Real-Time Dashboard**: Visual interface for monitoring requests, resources, and agent activities.

## 🗂️ Folder Structure

```
├── agents/
│   ├── request_processor/
│   │   ├── text_analyzer.py
│   │   ├── image_analyzer.py
│   │   └── voice_analyzer.py
│   ├── request_verifier/
│   ├── resource_allocator/
│   ├── consolation_bot/
│   └── rag_agent/
├── data/
│   └── mysql_setup.sql
├── dashboard/
│   ├── public/
│   └── src/
├── utils/
│   ├── geolocation.py
│   └── database.py
├── .env
├── main.py
├── requirements.txt
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

* Python 3.8+
* Node.js (for dashboard)
* MySQL Server

### Installation

**Configure Environment Variables**

   Create a `.env` file in the root directory with the following content:

   ```env
   MYSQL_HOST=localhost
   MYSQL_USER=your_mysql_username
   MYSQL_PASSWORD=your_mysql_password
   MYSQL_DB=disaster_response
   ```

 **Initialize MySQL Database**

   * Start your MySQL server.

   * Create the database:

     ```sql
     CREATE DATABASE disaster_response;
     ```

   * Execute the SQL script to create necessary tables:

     ```bash
     mysql -u your_mysql_username -p disaster_response < data/mysql_setup.sql
     ```

## 🧩 Agent Architecture

### 1. Request Processor Agent (Multi-Agent System)

* **Function**: Processes user inputs in text, image, and voice formats.
* **Sub-Agents**:

  * `text_analyzer.py`: Extracts information from textual inputs.
  * `image_analyzer.py`: Analyzes images to identify disaster-related elements.
  * `voice_analyzer.py`: Transcribes and interprets voice messages.

### 2. Request Verifier Agent

* **Function**: Validates the legitimacy of processed requests.
* **Logic**:

  * Extracts geolocation from the request.
  * Checks for existing requests within a 5km radius.
  * If two or more requests are found, marks the new request as legitimate.

### 3. Resource Allocator Agent

* **Function**: Allocates available resources to verified requests.
* **Logic**:

  * Queries the MySQL database for resource availability in the specified location.
  * Assigns resources based on the type of disaster and urgency.
  * Updates the allocation records in the database.

### 4. Consolation Bot Agent

* **Function**: Provides emotional support and safety tips.
* **Logic**:

  * Analyzes the user's message for signs of panic or distress.
  * Responds with calming messages and relevant safety information.

### 5. RAG Agent

* **Function**: Retrieves information from reports and web searches.
* **Logic**:

  * Performs web searches to gather the latest information.
  * Uses Retrieval-Augmented Generation (RAG) to provide context-aware responses.

## 🔗 Protocol Integration

### Agent-to-Agent (A2A) Protocol

The platform utilizes the A2A protocol to enable seamless communication between agents. Each agent operates as an independent service, communicating through standardized interfaces defined by the protocol.

* **Benefits**:

  * Interoperability between agents built on different platforms.
  * Secure and efficient communication.
  * Scalability and modularity.

### Model Context Protocol (MCP)

Integration with MCP allows agents to access external tools and data sources securely. By leveraging free MCP servers like Brave Browser MCP, the platform can perform advanced web automation, scraping, and testing tasks.

* **Benefits**:

  * Secure access to external tools and data.
  * Enhanced capabilities for agents.
  * Flexibility in integrating various services.

## 📊 Dashboard Features

* **Real-Time Monitoring**: View incoming requests and their statuses.
* **Resource Tracking**: Monitor the availability and allocation of resources.
* **Agent Activity Logs**: Track the actions and decisions made by each agent.

## 📈 Evaluation Metrics

* **Response Time**: Time taken to process and respond to requests.
* **Resource Utilization**: Efficiency in allocating available resources.
* **User Satisfaction**: Feedback collected from users post-interaction.


