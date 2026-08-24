"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
 function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
 return new (P || (P = Promise))(function (resolve, reject) {
 function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
 function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
 function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
 step((generator = generator.apply(thisArg, _arguments || [])).next());
 });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
 var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
 return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
 function verb(n) { return function (v) { return step([n, v]); }; }
 function step(op) {
 if (f) throw new TypeError("Generator is already executing.");
 while (g && (g = 0, op[0] && (_ = 0)), _) try {
 if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
 if (y = 0, t) op = [op[0] & 2, t.value];
 switch (op[0]) {
 case 0: case 1: t = op; break;
 case 4: _.label++; return { value: op[1], done: false };
 case 5: _.label++; y = op[1]; op = [0]; continue;
 case 7: op = _.ops.pop(); _.trys.pop(); continue;
 default:
 if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
 if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
 if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
 if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
 if (t[2]) _.ops.pop();
 _.trys.pop(); continue;
 }
 op = body.call(thisArg, _);
 } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
 if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
 }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
 return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var node_fetch_1 = __importDefault(require("node-fetch"));
// If running natively, express may already be available, if not, user needs to run `npm i express`
var app = (0, express_1.default)();
var port = 3001;
// Update these with your provided App ID and Secret
var APP_ID = '1522577345822759';
var APP_SECRET = 'e4be55e142ff55b6a98cf092ecb3edd6';
// This MUST match what you have registered in your Meta App Dashboard under "Threads API -> Settings"
var REDIRECT_URI = "http://localhost:".concat(port, "/auth");
app.get('/', function (req, res) {
 var authUrl = "https://threads.net/oauth/authorize?client_id=".concat(APP_ID, "&redirect_uri=").concat(encodeURIComponent(REDIRECT_URI), "&scope=threads_basic,threads_content_publish&response_type=code");
 res.send("\n <html>\n <body style=\"font-family: sans-serif; padding: 2rem;\">\n <h2>Threads Authentication</h2>\n <p>Click the link below to authorize your Threads account.</p>\n <p><b>Important:</b> You must have \"http://localhost:3001/auth\" added as a valid redirect URI in your Meta App Dashboard.</p>\n <a href=\"".concat(authUrl, "\" style=\"background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;\">Authorize Threads</a>\n </body>\n </html>\n "));
});
app.get('/auth', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
 var code, tokenForm, tokenRes, errText, tokenData, shortLivedToken, userId, longLivedRes, errText, longLivedData, longLivedToken, envUpdate, err_1;
 return __generator(this, function (_a) {
 switch (_a.label) {
 case 0:
 code = req.query.code;
 if (!code) {
 return [2 /*return*/, res.send('Error: No code received.')];
 }
 _a.label = 1;
 case 1:
 _a.trys.push([1, 10,, 11]);
 tokenForm = new URLSearchParams({
 client_id: APP_ID,
 client_secret: APP_SECRET,
 grant_type: 'authorization_code',
 redirect_uri: REDIRECT_URI,
 code: code,
 });
 console.log('Exchanging code for short-lived token...');
 return [4 /*yield*/, (0, node_fetch_1.default)('https://graph.threads.net/oauth/access_token', {
 method: 'POST',
 body: tokenForm,
 })];
 case 2:
 tokenRes = _a.sent();
 if (!!tokenRes.ok) return [3 /*break*/, 4];
 return [4 /*yield*/, tokenRes.text()];
 case 3:
 errText = _a.sent();
 console.error('Token fetch error:', errText);
 return [2 /*return*/, res.send("Failed to get short-lived token: ".concat(errText))];
 case 4: return [4 /*yield*/, tokenRes.json()];
 case 5:
 tokenData = _a.sent();
 shortLivedToken = tokenData.access_token;
 userId = tokenData.user_id;
 // 2. Exchange short-lived token for long-lived token
 console.log('Exchanging short-lived token for long-lived token...');
 return [4 /*yield*/, (0, node_fetch_1.default)("https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=".concat(APP_SECRET, "&access_token=").concat(shortLivedToken))];
 case 6:
 longLivedRes = _a.sent();
 if (!!longLivedRes.ok) return [3 /*break*/, 8];
 return [4 /*yield*/, longLivedRes.text()];
 case 7:
 errText = _a.sent();
 console.error('Long-lived token fetch error:', errText);
 return [2 /*return*/, res.send("Failed to get long-lived token: ".concat(errText))];
 case 8: return [4 /*yield*/, longLivedRes.json()];
 case 9:
 longLivedData = _a.sent();
 longLivedToken = longLivedData.access_token;
 envUpdate = "THREADS_USER_ID=".concat(userId, "\nTHREADS_ACCESS_TOKEN=").concat(longLivedToken, "\n");
 console.log('\n=============================================');
 console.log('SUCCESS! Add these to your.env file:');
 console.log('=============================================');
 console.log(envUpdate);
 console.log('=============================================\n');
 res.send("\n <html>\n <body style=\"font-family: sans-serif; padding: 2rem;\">\n <h2>Success! \uD83C\uDF89</h2>\n <p>Your tokens have been generated. Check your terminal output.</p>\n <p>You can now safely close this window and stop the server in your terminal.</p>\n </body>\n </html>\n ");
 // Optionally stop the server
 setTimeout(function () {
 console.log('Shutting down auth server...');
 process.exit(0);
 }, 2000);
 return [3 /*break*/, 11];
 case 10:
 err_1 = _a.sent();
 console.error(err_1);
 res.send('An error occurred during authentication.');
 return [3 /*break*/, 11];
 case 11: return [2 /*return*/];
 }
 });
}); });
app.listen(port, function () {
 console.log("Auth server running at http://localhost:".concat(port));
 console.log('Open this URL in your browser to begin the OAuth flow.');
});
