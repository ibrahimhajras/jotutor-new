import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

export const app = express();

async function startServer() {
  app.use(cors());
  app.use(express.json());

  // Add Permissions-Policy header to allow Payment Request API in iframes
  app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'payment=*');
    next();
  });

  const GATEWAY_URL = process.env.MASTERCARD_GATEWAY_URL || "https://ap-gateway.mastercard.com";
  const MERCHANT_ID = (process.env.MASTERCARD_MERCHANT_ID || "").trim();
  const API_PASSWORD = (process.env.MASTERCARD_API_PASSWORD || "").trim();
  const AUTH_HEADER = `Basic ${Buffer.from(`merchant.${MERCHANT_ID}:${API_PASSWORD}`).toString('base64')}`;

  // ============================================================
  // STEP 1: Create a simple session (no INITIATE_CHECKOUT)
  // ============================================================
  app.post("/api/payment/session", async (req, res) => {
    const { amount, currency, orderId } = req.body;

    if (!MERCHANT_ID || !API_PASSWORD) {
      return res.status(500).json({
        error: "Mastercard configuration missing",
        message: "Please ensure MASTERCARD_MERCHANT_ID and MASTERCARD_API_PASSWORD are set."
      });
    }

    try {
      console.log(`[Session] Creating session for order: ${orderId}, amount: ${amount} ${currency}`);

      // Create a simple session - card details will be added by session.js on the frontend
      const response = await fetch(
        `${GATEWAY_URL}/api/rest/version/100/merchant/${MERCHANT_ID}/session`,
        {
          method: "POST",
          headers: {
            "Authorization": AUTH_HEADER,
            "Content-Type": "application/json;charset=UTF-8",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            session: {
              authenticationLimit: 5
            }
          })
        }
      );

      const rawText = await response.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        console.error("[Session] Failed to parse response:", rawText.substring(0, 500));
        return res.status(502).json({ error: "Invalid response from gateway", rawResponse: rawText.substring(0, 200) });
      }

      console.log("[Session] Response:", JSON.stringify(data, null, 2));

      if (response.ok && data.session && data.session.id) {
        res.json({
          sessionId: data.session.id,
          merchantId: MERCHANT_ID,
          gatewayUrl: GATEWAY_URL
        });
      } else {
        console.error("[Session] Error:", data);
        res.status(response.status || 500).json({ error: "Failed to create session", details: data });
      }
    } catch (error: any) {
      console.error("[Session] Server Error:", error);
      res.status(500).json({ error: "Internal server error", message: error.message });
    }
  });

  // ============================================================
  // STEP 2: Initiate 3DS Authentication (server-side)
  // ============================================================
  app.post("/api/payment/initiate-auth", async (req, res) => {
    const { orderId, transactionId, sessionId, amount, currency, returnUrl } = req.body;

    try {
      console.log(`[3DS-Initiate] Order: ${orderId}, Transaction: ${transactionId}`);

      const url = `${GATEWAY_URL}/api/rest/version/100/merchant/${MERCHANT_ID}/order/${orderId}/transaction/${transactionId}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Authorization": AUTH_HEADER,
          "Content-Type": "application/json;charset=UTF-8"
        },
        body: JSON.stringify({
          apiOperation: "INITIATE_AUTHENTICATION",
          authentication: {
            acceptVersions: "3DS1,3DS2",
            channel: "PAYER_BROWSER",
            purpose: "PAYMENT_TRANSACTION"
          },
          session: {
            id: sessionId
          },
          order: {
            currency: currency
          }
        })
      });

      const data = await response.json();
      console.log("[3DS-Initiate] Response:", JSON.stringify(data, null, 2));
      res.json(data);
    } catch (error: any) {
      console.error("[3DS-Initiate] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================
  // STEP 3: Authenticate Payer (server-side)
  // ============================================================
  app.post("/api/payment/authenticate", async (req, res) => {
    const { orderId, transactionId, sessionId, amount, currency, browserDetails } = req.body;

    try {
      console.log(`[3DS-Auth] Order: ${orderId}, Transaction: ${transactionId}`);

      const url = `${GATEWAY_URL}/api/rest/version/100/merchant/${MERCHANT_ID}/order/${orderId}/transaction/${transactionId}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Authorization": AUTH_HEADER,
          "Content-Type": "application/json;charset=UTF-8"
        },
        body: JSON.stringify({
          apiOperation: "AUTHENTICATE_PAYER",
          authentication: {
            redirectResponseUrl: browserDetails?.returnUrl || `${req.protocol}://${req.get('host')}/payment`
          },
          device: {
            browser: "MOZILLA",
            browserDetails: {
              javaEnabled: browserDetails?.javaEnabled || false,
              language: browserDetails?.language || "en-US",
              screenHeight: browserDetails?.screenHeight || 768,
              screenWidth: browserDetails?.screenWidth || 1366,
              timeZone: browserDetails?.timeZone || -180,
              colorDepth: browserDetails?.colorDepth || 24,
              "3DSecureChallengeWindowSize": "FULL_SCREEN",
              acceptHeaders: "text/html"
            },
            ipAddress: req.ip
          },
          order: {
            amount: String(Number(amount).toFixed(2)),
            currency: currency
          },
          session: {
            id: sessionId
          }
        })
      });

      const data = await response.json();
      console.log("[3DS-Auth] Response:", JSON.stringify(data, null, 2));
      res.json(data);
    } catch (error: any) {
      console.error("[3DS-Auth] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================
  // STEP 3.5: Handle 3DS Redirect Callback from Bank ACS
  // ============================================================
  app.post("/api/payment/3ds-callback", (req, res) => {
    // The bank will POST data here after the OTP challenge
    console.log("[3DS-Callback] Received data from bank ACS:", Object.keys(req.body || {}));

    // Use window.top to reach the React app regardless of iframe nesting depth
    const htmlResponse = `
      <!DOCTYPE html>
      <html>
      <head><title>3DS Complete</title></head>
      <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f0f0f0;">
        <div style="text-align:center;padding:20px;">
          <div style="font-size:32px;margin-bottom:12px;">✅</div>
          <h3 style="color:#002146;margin:0 0 8px">تم التحقق بنجاح</h3>
          <p style="color:#666;font-size:13px;margin:0">جاري إتمام الدفع...</p>
        </div>
        <script>
          // Send to all possible parent contexts: popup opener, top frame, or parent frame
          function notify() {
            var targets = [];
            try { if (window.opener) targets.push(window.opener); } catch(e) {}
            try { if (window.top && window.top !== window) targets.push(window.top); } catch(e) {}
            try { if (window.parent && window.parent !== window) targets.push(window.parent); } catch(e) {}
            targets.forEach(function(t) { try { t.postMessage('3ds_challenge_complete', '*'); } catch(e) {} });
          }
          notify();
          // Retry after 500ms in case parent context needs time to set up listener
          setTimeout(notify, 500);
        </script>
      </body>
      </html>
    `;
    res.send(htmlResponse);
  });



  // ============================================================
  // STEP 4: Execute the Payment (PAY API)
  // ============================================================
  app.post("/api/payment/pay", async (req, res) => {
    const { orderId, transactionId, sessionId, amount, currency, authTransactionId } = req.body;

    try {
      // Use a unique transaction ID for the PAY operation
      const payTransactionId = `pay-${Date.now()}`;
      console.log(`[PAY] Order: ${orderId}, Pay Transaction: ${payTransactionId}`);

      const url = `${GATEWAY_URL}/api/rest/version/100/merchant/${MERCHANT_ID}/order/${orderId}/transaction/${payTransactionId}`;

      const body: any = {
        apiOperation: "PAY",
        order: {
          amount: String(Number(amount).toFixed(2)),
          currency: currency,
          reference: orderId,
          description: `JoTutor Course Payment - ${orderId}`
        },
        session: {
          id: sessionId
        }
      };

      // Re-link 3DS authentication to the PAY transaction.
      // We only get here after polling confirmed AUTHENTICATION_SUCCESSFUL,
      // so the transactionStatus is "Y" and this will be accepted by the gateway.
      if (authTransactionId) {
        body.authentication = {
          transactionId: authTransactionId
        };
      }

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Authorization": AUTH_HEADER,
          "Content-Type": "application/json;charset=UTF-8"
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      console.log("[PAY] Response:", JSON.stringify(data, null, 2));

      if (data.result === "SUCCESS") {
        console.log("[PAY] ✅ PAYMENT SUCCESS!");
        res.json({
          success: true,
          result: data.result,
          status: data.order?.status,
          amount: data.order?.amount,
          currency: data.order?.currency,
          transactionId: payTransactionId,
          gatewayCode: data.response?.gatewayCode
        });
      } else {
        console.log("[PAY] ❌ PAYMENT FAILED:", data.result);
        res.json({
          success: false,
          result: data.result,
          error: data.error || data.response,
          gatewayCode: data.response?.gatewayCode,
          details: data
        });
      }
    } catch (error: any) {
      console.error("[PAY] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================
  // Order Status Query (diagnostic)
  // ============================================================
  app.get("/api/payment/order-status/:orderId", async (req, res) => {
    const { orderId } = req.params;
    try {
      const response = await fetch(
        `${GATEWAY_URL}/api/rest/version/100/merchant/${MERCHANT_ID}/order/${orderId}`,
        { method: "GET", headers: { "Authorization": AUTH_HEADER, "Content-Type": "application/json" } }
      );
      const data = await response.json();
      console.log(`[OrderStatus] Full Response:`, JSON.stringify(data, null, 2));
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development (local only)
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("/{*splat}", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

}

// Only start the local server when NOT running in Netlify Functions
if (!process.env.NETLIFY) {
  const PORT = Number(process.env.PORT) || 3000;
  startServer().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}
