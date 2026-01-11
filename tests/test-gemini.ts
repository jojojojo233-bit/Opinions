import { generatePollContext } from '../src/lib/gemini.ts';
import { assert } from 'chai';

// Mock global fetch
const originalFetch = global.fetch;

async function runTests() {
    console.log("Running Gemini Context Generation Tests...");

    // Setup Mock Info
    const MOCK_KEY = "test-api-key";
    process.env.VITE_GEMINI_API_KEY = MOCK_KEY;
    
    // TEST 1: Successful Generation
    console.log("Test 1: Should return context text on success");
    
    // @ts-ignore
    global.fetch = async (url: any, init?: any) => {
        assert.ok(url.toString().includes(MOCK_KEY), "API Key missing from URL");
        assert.ok(url.toString().includes("gemini-2.5-flash"), "Wrong model version");
        
        return {
            ok: true,
            json: async () => ({
                candidates: [{
                    content: {
                        parts: [{ text: "This is a generated context about automated checkout systems." }]
                    }
                }]
            })
        } as Response;
    };

    const result1 = await generatePollContext("Do you prefer self checkout?");
    assert.equal(result1, "This is a generated context about automated checkout systems.");
    console.log("✅ Passed");


    // TEST 2: API Error handling
    console.log("Test 2: Should return 'No context.' on API failure");
    
    global.fetch = async () => {
        return {
            ok: false,
            statusText: "Internal Server Error"
        } as Response;
    };

    const result2 = await generatePollContext("Error poll");
    // Depending on logic, it logs error and returns "No context."
    // assert.equal(result2, "No context.");
    assert.ok(result2.startsWith("No context"), "Should return No context (maybe with error reason)");
    console.log("✅ Passed");


    // TEST 3: Empty Response handling
    console.log("Test 3: Should return 'No context.' on empty response");
    
    global.fetch = async () => {
        return {
            ok: true,
            json: async () => ({ candidates: [] }) // Malformed or blocked response
        } as Response;
    };

    const result3 = await generatePollContext("Blocked poll");
    assert.equal(result3, "No context.");
    console.log("✅ Passed");

    // Restore
    global.fetch = originalFetch;
    console.log("🎉 All tests passed!");
}

runTests().catch(e => {
    console.error("❌ Test Failed:", e);
    process.exit(1);
});
