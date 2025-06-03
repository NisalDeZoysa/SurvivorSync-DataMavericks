import os
import http.client
import json
from mcp.server.fastmcp import FastMCP

# mcp = FastMCP("message-send")

# @mcp.tool()
# def output_requests(phone: str, title: str, description: str) -> dict:
#     """
#     Send SMS via Infobip API using http.client with given phone, title, and description.
#     """
#     try:
#         # Infobip host and API path
#         infobip_host = "z3z326.api.infobip.com"  # replace with your Infobip host
#         api_path = "/sms/3/messages"

#         # Authorization header value, e.g. "App YOUR_API_KEY"
#         api_key = "bfe7910d691ff8dcffcba02d39931ef4-feb39245-aadc-4c60-b5e6-556e68cc9deb"
        

#         headers = {
#             'Authorization': f'App {api_key}',
#             'Content-Type': 'application/json',
#             'Accept': 'application/json'
#         }

#         # Compose message text combining title and description
#         message_text = f"{title}\n{description}"

#         payload = json.dumps({
#             "messages": [
#                 {
#                     "sender": "InfoSMS",  # Replace with your approved sender name
#                     "destinations": [
#                         {"to": phone}
#                     ],
#                     "content": {
#                         "text": message_text
#                     }
#                 }
#             ]
#         })

#         conn = http.client.HTTPSConnection(infobip_host)
#         conn.request("POST", api_path, payload, headers)
#         res = conn.getresponse()
#         data = res.read()
#         response_json = json.loads(data.decode("utf-8"))

#         if res.status >= 200 and res.status < 300:
#             return {
#                 "status": "success",
#                 "message": f"SMS sent to {phone}",
#                 "infobip_response": response_json
#             }
#         else:
#             return {
#                 "status": "error",
#                 "message": f"Failed to send SMS: {res.status} {res.reason}",
#                 "infobip_response": response_json
#             }

#     except Exception as e:
#         return {
#             "status": "error",
#             "message": str(e)
#         }

import os
import http.client
import json
from mcp.server.fastmcp import FastMCP

# mcp = FastMCP("message-send")

# @mcp.tool()
def output_requests(phone: str, title: str, description: str) -> dict:
    """
    Send WhatsApp text message via Infobip API using http.client.
    Combines title and description into the message text.
    """
    try:
        infobip_host = "z3z326.api.infobip.com"  # Replace with your Infobip host
        api_path = "/whatsapp/1/message/text"

        api_key = "bfe7910d691ff8dcffcba02d39931ef4-feb39245-aadc-4c60-b5e6-556e68cc9deb"

        headers = {
            'Authorization': f'App {api_key}',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }

        message_text = f"{title}\n{description}"

        # Generate a unique messageId (UUID recommended)
        import uuid
        message_id = str(uuid.uuid4())

        payload = json.dumps({
            "from": "+94720570452",  # Replace with your WhatsApp sender number registered with Infobip
            "to": phone,
            "messageId": message_id,
            "content": {
                "text": message_text
            },
            "callbackData": "Callback data",
            "urlOptions": {
                "shortenUrl": True,
                "trackClicks": True,
                "removeProtocol": True,
            }
        })

        conn = http.client.HTTPSConnection(infobip_host)
        conn.request("POST", api_path, payload, headers)
        res = conn.getresponse()
        data = res.read()
        response_json = json.loads(data.decode("utf-8"))

        if 200 <= res.status < 300:
            return {
                "status": "success",
                "message": f"WhatsApp message sent to {phone}",
                "infobip_response": response_json
            }
        else:
            return {
                "status": "error",
                "message": f"Failed to send WhatsApp message: {res.status} {res.reason}",
                "infobip_response": response_json
            }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


if __name__ == "__main__":
    # mcp.run(transport="stdio")
    print(output_requests("+94711570452", "title", "description"))


