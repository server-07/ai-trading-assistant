import random
import datetime
import time
import threading
import urllib.parse
import requests

def get_base_picks():
    return {
        "1D": {
            "bullish": [
                {"ticker": "ZOMATO", "exchange": "NSE", "catalyst_core": "Intraday volume spike due to sudden positive analyst coverage.", "full_news": "Global brokerage firm upgrades Zomato citing robust growth in Blinkit and stable core food delivery margins. Expects strong open.", "directional_conviction": "High", "expected_margin_low": 1.5, "expected_margin_high": 3.0, "stop_loss_atr": 5.0, "invalidation_level": 160.0, "ltp": 165.0, "predictive_open": 168.0},
                {"ticker": "TSLA", "exchange": "NASDAQ", "catalyst_core": "Elon Musk tweet overnight hinting at new robotaxi feature.", "full_news": "Elon Musk teased an upcoming Full Self-Driving update focusing entirely on autonomous taxi routing algorithms, sparking pre-market retail buying.", "directional_conviction": "Medium", "expected_margin_low": 2.0, "expected_margin_high": 4.5, "stop_loss_atr": 8.0, "invalidation_level": 170.0, "ltp": 175.50, "predictive_open": 178.0},
                {"ticker": "SUZLON", "exchange": "NSE", "catalyst_core": "Major new order win from state utility announced.", "full_news": "Suzlon Energy bags 400 MW order from Rajasthan state utility, strengthening its order book visibility for the next two quarters.", "directional_conviction": "High", "expected_margin_low": 3.0, "expected_margin_high": 5.0, "stop_loss_atr": 2.5, "invalidation_level": 48.0, "ltp": 51.50, "predictive_open": 53.50},
                {"ticker": "NVDA", "exchange": "NASDAQ", "catalyst_core": "Supplier confirms increased component orders for Hopper GPUs.", "full_news": "Asian supply chain sources indicate a 15% WoW increase in substrate orders from Nvidia, hinting at strong datacenter demand.", "directional_conviction": "High", "expected_margin_low": 1.5, "expected_margin_high": 3.5, "stop_loss_atr": 15.0, "invalidation_level": 115.0, "ltp": 122.50, "predictive_open": 125.0},
                {"ticker": "TATASTEEL", "exchange": "NSE", "catalyst_core": "Global iron ore prices surge overnight.", "full_news": "Dalian iron ore futures hit a 3-month high on China stimulus hopes, lifting sentiment for Indian metal stocks in early trade.", "directional_conviction": "Medium", "expected_margin_low": 1.0, "expected_margin_high": 2.5, "stop_loss_atr": 4.5, "invalidation_level": 158.0, "ltp": 162.0, "predictive_open": 164.50},
                {"ticker": "AAPL", "exchange": "NASDAQ", "catalyst_core": "Apple Intelligence beta rollout begins for developers.", "full_news": "Apple quietly seeded the first developer beta containing Apple Intelligence features, sparking positive sentiment on social media platforms.", "directional_conviction": "High", "expected_margin_low": 0.8, "expected_margin_high": 1.8, "stop_loss_atr": 2.0, "invalidation_level": 190.0, "ltp": 193.50, "predictive_open": 195.0},
                {"ticker": "IREDA", "exchange": "NSE", "catalyst_core": "Credit rating upgrade by domestic rating agency.", "full_news": "ICRA upgrades IREDA's long-term rating to AAA, citing strong asset quality and government backing. Expected to reduce borrowing costs.", "directional_conviction": "High", "expected_margin_low": 4.0, "expected_margin_high": 8.0, "stop_loss_atr": 9.0, "invalidation_level": 175.0, "ltp": 188.0, "predictive_open": 195.0},
                {"ticker": "AMZN", "exchange": "NASDAQ", "catalyst_core": "AWS secures massive enterprise contract with global bank.", "full_news": "Amazon Web Services beats out Microsoft and Google for a multi-year cloud migration deal with a major European financial institution.", "directional_conviction": "High", "expected_margin_low": 1.5, "expected_margin_high": 2.5, "stop_loss_atr": 4.5, "invalidation_level": 180.0, "ltp": 185.50, "predictive_open": 188.0},
                {"ticker": "HAL", "exchange": "NSE", "catalyst_core": "Ministry of Defence clears procurement of advanced helicopters.", "full_news": "The Defense Acquisition Council has given the initial nod for the procurement of 34 advanced light helicopters from HAL.", "directional_conviction": "High", "expected_margin_low": 2.0, "expected_margin_high": 4.5, "stop_loss_atr": 120.0, "invalidation_level": 4500.0, "ltp": 4650.0, "predictive_open": 4750.0},
                {"ticker": "CRWD", "exchange": "NASDAQ", "catalyst_core": "Competitor faces major vulnerability disclosure.", "full_news": "A severe zero-day vulnerability was disclosed in a rival endpoint protection product, likely driving short-term enterprise migrations to CrowdStrike.", "directional_conviction": "High", "expected_margin_low": 2.5, "expected_margin_high": 5.0, "stop_loss_atr": 10.0, "invalidation_level": 340.0, "ltp": 355.0, "predictive_open": 362.0}
            ],
            "bearish": [
                {"ticker": "PAYTM", "exchange": "NSE", "catalyst_core": "Regulatory tightening on third-party lending partnerships.", "full_news": "RBI issues new circular mandating stricter capital requirements for fintech lending partnerships, directly impacting Paytm's loan distribution margins.", "directional_conviction": "High", "expected_margin_low": -2.0, "expected_margin_high": -5.0, "stop_loss_atr": 15.0, "invalidation_level": 450.0, "ltp": 420.0, "predictive_open": 405.0},
                {"ticker": "INTC", "exchange": "NASDAQ", "catalyst_core": "Delay in next-gen fab construction timeline.", "full_news": "Intel announces a 6-month delay in its Ohio foundry construction due to slower-than-expected CHIPS Act funding disbursement.", "directional_conviction": "High", "expected_margin_low": -1.5, "expected_margin_high": -3.5, "stop_loss_atr": 1.5, "invalidation_level": 32.0, "ltp": 30.0, "predictive_open": 29.0},
                {"ticker": "WIPRO", "exchange": "NSE", "catalyst_core": "Unexpected margin compression indicated in management commentary.", "full_news": "Wipro management warns of margin pressure in Q1 due to wage hikes and slower client decision-making in the banking sector.", "directional_conviction": "Medium", "expected_margin_low": -1.0, "expected_margin_high": -2.5, "stop_loss_atr": 8.0, "invalidation_level": 480.0, "ltp": 465.0, "predictive_open": 458.0},
                {"ticker": "BA", "exchange": "NASDAQ", "catalyst_core": "FAA launches new investigation into manufacturing defects.", "full_news": "A whistleblower report prompts the FAA to open a fresh audit into Boeing's 787 Dreamliner assembly line processes.", "directional_conviction": "High", "expected_margin_low": -2.5, "expected_margin_high": -4.0, "stop_loss_atr": 5.0, "invalidation_level": 185.0, "ltp": 178.0, "predictive_open": 173.0},
                {"ticker": "ITC", "exchange": "NSE", "catalyst_core": "FMCG rural volume recovery slower than expected.", "full_news": "Industry data suggests rural FMCG consumption remains sluggish despite easing inflation, dampening near-term sentiment for ITC's FMCG division.", "directional_conviction": "Low", "expected_margin_low": -0.5, "expected_margin_high": -1.5, "stop_loss_atr": 5.0, "invalidation_level": 440.0, "ltp": 432.0, "predictive_open": 428.0}
            ]
        },
        "1W": {
            "bullish": [
                {"ticker": "HDFCBANK", "exchange": "NSE", "catalyst_core": "Sustained FII inflow over the last 5 sessions driving momentum.", "full_news": "Foreign Institutional Investors have consistently bought HDFC Bank for 5 straight days following the latest deposit growth data. Technicals point to a breakout.", "directional_conviction": "High", "expected_margin_low": 3.0, "expected_margin_high": 5.0, "stop_loss_atr": 25.0, "invalidation_level": 1450.0, "ltp": 1480.0, "predictive_open": 1495.0},
                {"ticker": "AAPL", "exchange": "NASDAQ", "catalyst_core": "Anticipation of WWDC announcements building over the week.", "full_news": "Supply chain leaks suggest Apple's new AI features will be deeply integrated into iOS 18. Hedge funds are positioning ahead of the keynote.", "directional_conviction": "High", "expected_margin_low": 2.5, "expected_margin_high": 6.0, "stop_loss_atr": 4.5, "invalidation_level": 185.0, "ltp": 189.0, "predictive_open": 192.5},
                {"ticker": "LARSEN", "exchange": "NSE", "catalyst_core": "Middle East order pipeline expansion expected this week.", "full_news": "L&T is the frontrunner for a multi-billion dollar infrastructure project in Saudi Arabia, with an official announcement expected by Friday.", "directional_conviction": "High", "expected_margin_low": 4.0, "expected_margin_high": 7.0, "stop_loss_atr": 80.0, "invalidation_level": 3400.0, "ltp": 3520.0, "predictive_open": 3560.0},
                {"ticker": "MSFT", "exchange": "NASDAQ", "catalyst_core": "Copilot enterprise adoption rate exceeding internal targets.", "full_news": "Leaked internal memos indicate Microsoft's Copilot for M365 is seeing a 40% faster adoption rate than projected for Q2.", "directional_conviction": "Medium", "expected_margin_low": 2.0, "expected_margin_high": 4.0, "stop_loss_atr": 12.0, "invalidation_level": 415.0, "ltp": 430.0, "predictive_open": 435.0},
                {"ticker": "ADANIENT", "exchange": "NSE", "catalyst_core": "Fundraising closure and debt reduction timeline.", "full_news": "The company is expected to finalize its $2B institutional placement this week, significantly reducing leverage and funding green energy projects.", "directional_conviction": "High", "expected_margin_low": 5.0, "expected_margin_high": 9.0, "stop_loss_atr": 100.0, "invalidation_level": 3000.0, "ltp": 3200.0, "predictive_open": 3280.0},
                {"ticker": "GOOGL", "exchange": "NASDAQ", "catalyst_core": "Gemini integration into Android ecosystem accelerates.", "full_news": "Google is rolling out Gemini Nano to a wider range of Android devices this week, challenging Apple's on-device AI narrative.", "directional_conviction": "Medium", "expected_margin_low": 2.0, "expected_margin_high": 3.5, "stop_loss_atr": 5.0, "invalidation_level": 170.0, "ltp": 178.0, "predictive_open": 181.0},
                {"ticker": "SBIN", "exchange": "NSE", "catalyst_core": "Credit growth metrics outpacing private peers.", "full_news": "Latest sector data shows SBI capturing market share in retail lending segments, driving bullish sentiment for the upcoming week.", "directional_conviction": "High", "expected_margin_low": 2.5, "expected_margin_high": 4.5, "stop_loss_atr": 15.0, "invalidation_level": 800.0, "ltp": 825.0, "predictive_open": 835.0},
                {"ticker": "AMD", "exchange": "NASDAQ", "catalyst_core": "MI300X shipments scaling up faster than expected.", "full_news": "Supply chain checks reveal AMD is securing more CoWoS capacity from TSMC, allowing them to fulfill AI accelerator orders faster this week.", "directional_conviction": "High", "expected_margin_low": 4.0, "expected_margin_high": 8.0, "stop_loss_atr": 8.0, "invalidation_level": 155.0, "ltp": 165.0, "predictive_open": 170.0},
                {"ticker": "TATAMOTORS", "exchange": "NSE", "catalyst_core": "JLR sales data points to strong Europe recovery.", "full_news": "Preliminary registration data from Europe shows Jaguar Land Rover sales jumping 15% YoY, alleviating concerns over slowing luxury demand.", "directional_conviction": "High", "expected_margin_low": 3.0, "expected_margin_high": 5.5, "stop_loss_atr": 20.0, "invalidation_level": 940.0, "ltp": 980.0, "predictive_open": 995.0},
                {"ticker": "META", "exchange": "NASDAQ", "catalyst_core": "Llama 3 open-source traction driving developer ecosystem.", "full_news": "Meta's decision to open-source its latest models is accelerating developer adoption, creating a moat against proprietary models. Analysts upgrading.", "directional_conviction": "Medium", "expected_margin_low": 2.5, "expected_margin_high": 4.0, "stop_loss_atr": 14.0, "invalidation_level": 480.0, "ltp": 495.0, "predictive_open": 502.0}
            ],
            "bearish": [
                {"ticker": "BANDHANBNK", "exchange": "NSE", "catalyst_core": "Microfinance stress rising in key geographical segments.", "full_news": "Collection efficiencies in eastern states have shown a slight dip, raising concerns over asset quality for MFI-heavy lenders like Bandhan Bank.", "directional_conviction": "High", "expected_margin_low": -3.0, "expected_margin_high": -6.0, "stop_loss_atr": 8.0, "invalidation_level": 210.0, "ltp": 195.0, "predictive_open": 188.0},
                {"ticker": "SBUX", "exchange": "NASDAQ", "catalyst_core": "China sales metrics continue to disappoint.", "full_news": "Channel checks suggest Starbucks is losing further market share to local competitors in China, prompting downgrades ahead of the week.", "directional_conviction": "High", "expected_margin_low": -2.0, "expected_margin_high": -4.5, "stop_loss_atr": 2.5, "invalidation_level": 82.0, "ltp": 78.0, "predictive_open": 76.0},
                {"ticker": "DELHIVERY", "exchange": "NSE", "catalyst_core": "E-commerce volume growth slowing down.", "full_news": "Recent data indicates a moderation in tier-2 city e-commerce order volumes, negatively impacting logistics players' revenue visibility.", "directional_conviction": "Medium", "expected_margin_low": -2.0, "expected_margin_high": -4.0, "stop_loss_atr": 12.0, "invalidation_level": 420.0, "ltp": 395.0, "predictive_open": 388.0},
                {"ticker": "DIS", "exchange": "NASDAQ", "catalyst_core": "Theme park attendance misses summer projections.", "full_news": "Early summer booking data for Disney's domestic parks shows a weaker-than-expected turnout, dragging down the stock for the week.", "directional_conviction": "Medium", "expected_margin_low": -1.5, "expected_margin_high": -3.0, "stop_loss_atr": 3.0, "invalidation_level": 105.0, "ltp": 100.0, "predictive_open": 98.0},
                {"ticker": "HINDUNILVR", "exchange": "NSE", "catalyst_core": "Input cost inflation squeezing gross margins.", "full_news": "Rising crude and palm oil prices are expected to compress HUL's margins this week, as price hikes are difficult in a competitive market.", "directional_conviction": "Low", "expected_margin_low": -1.0, "expected_margin_high": -2.5, "stop_loss_atr": 45.0, "invalidation_level": 2400.0, "ltp": 2320.0, "predictive_open": 2295.0}
            ]
        },
        "1M": {
            "bullish": [
                {"ticker": "INFY", "exchange": "NSE", "catalyst_core": "Monthly macro shift towards defensive IT as rate cut hopes fade.", "full_news": "With US inflation data coming in hot over the month, investors are rotating out of growth and back into stable dividend-paying IT firms like Infosys.", "directional_conviction": "Medium", "expected_margin_low": 4.0, "expected_margin_high": 8.0, "stop_loss_atr": 45.0, "invalidation_level": 1400.0, "ltp": 1420.0, "predictive_open": 1445.0},
                {"ticker": "META", "exchange": "NASDAQ", "catalyst_core": "Strong ad revenue growth metrics verified over the rolling 30 days.", "full_news": "Third-party tracking tools indicate Meta's Instagram Reels monetization has increased by 15% month-over-month. AI engine forecasts sustained gap up.", "directional_conviction": "High", "expected_margin_low": 5.0, "expected_margin_high": 10.0, "stop_loss_atr": 15.0, "invalidation_level": 480.0, "ltp": 490.0, "predictive_open": 505.0},
                {"ticker": "ICICIBANK", "exchange": "NSE", "catalyst_core": "Consistent net interest margin expansion over the month.", "full_news": "ICICI Bank's strategic repricing of loans is paying off, with NIMs expected to hit record highs this month according to analyst models.", "directional_conviction": "High", "expected_margin_low": 4.5, "expected_margin_high": 7.5, "stop_loss_atr": 30.0, "invalidation_level": 1100.0, "ltp": 1150.0, "predictive_open": 1175.0},
                {"ticker": "NFLX", "exchange": "NASDAQ", "catalyst_core": "Password sharing crackdown yields sustained subscriber additions.", "full_news": "Data shows the paid sharing rollout continues to drive steady monthly subscriber growth in Latin America and APAC regions.", "directional_conviction": "High", "expected_margin_low": 6.0, "expected_margin_high": 12.0, "stop_loss_atr": 25.0, "invalidation_level": 600.0, "ltp": 640.0, "predictive_open": 655.0},
                {"ticker": "M&M", "exchange": "NSE", "catalyst_core": "SUV booking backlog remains robust despite high interest rates.", "full_news": "Mahindra & Mahindra's SUV cancellations are practically zero, and new launches are keeping the waiting period high, securing monthly revenue visibility.", "directional_conviction": "High", "expected_margin_low": 5.0, "expected_margin_high": 9.0, "stop_loss_atr": 60.0, "invalidation_level": 2600.0, "ltp": 2750.0, "predictive_open": 2810.0},
                {"ticker": "CRWD", "exchange": "NASDAQ", "catalyst_core": "Cybersecurity spending consolidation favoring platform players.", "full_news": "CIO surveys over the last month indicate a strong preference for consolidating security vendors onto CrowdStrike's Falcon platform.", "directional_conviction": "High", "expected_margin_low": 8.0, "expected_margin_high": 14.0, "stop_loss_atr": 15.0, "invalidation_level": 320.0, "ltp": 350.0, "predictive_open": 365.0},
                {"ticker": "NTPC", "exchange": "NSE", "catalyst_core": "Power demand surge during peak summer driving load factors.", "full_news": "Record high temperatures across India have pushed NTPC's plant load factors to multi-year highs over the past 30 days.", "directional_conviction": "Medium", "expected_margin_low": 3.0, "expected_margin_high": 6.0, "stop_loss_atr": 8.0, "invalidation_level": 340.0, "ltp": 360.0, "predictive_open": 372.0},
                {"ticker": "SPOT", "exchange": "NASDAQ", "catalyst_core": "Price hikes sticking without significant churn.", "full_news": "Spotify's recent premium subscription price increases have seen minimal churn, drastically improving operating leverage for the month.", "directional_conviction": "High", "expected_margin_low": 5.0, "expected_margin_high": 10.0, "stop_loss_atr": 12.0, "invalidation_level": 290.0, "ltp": 315.0, "predictive_open": 328.0},
                {"ticker": "BHEL", "exchange": "NSE", "catalyst_core": "Revival in thermal power capex driving order inflows.", "full_news": "Government focus on adding base-load thermal capacity has resulted in BHEL securing massive turbine generator orders this month.", "directional_conviction": "High", "expected_margin_low": 6.0, "expected_margin_high": 12.0, "stop_loss_atr": 15.0, "invalidation_level": 270.0, "ltp": 305.0, "predictive_open": 320.0},
                {"ticker": "UBER", "exchange": "NASDAQ", "catalyst_core": "Delivery segment profitability inflecting upwards.", "full_news": "Uber Eats is showing structural margin improvements over the rolling month, shifting the narrative from growth-at-all-costs to profitable scale.", "directional_conviction": "Medium", "expected_margin_low": 4.0, "expected_margin_high": 7.5, "stop_loss_atr": 3.5, "invalidation_level": 68.0, "ltp": 74.0, "predictive_open": 77.0}
            ],
            "bearish": [
                {"ticker": "WIPRO", "exchange": "NSE", "catalyst_core": "Prolonged slowdown in discretionary IT spending.", "full_news": "Macro headwinds are forcing clients to pause digital transformation projects, hitting Wipro's monthly pipeline harder than its peers.", "directional_conviction": "High", "expected_margin_low": -4.0, "expected_margin_high": -8.0, "stop_loss_atr": 12.0, "invalidation_level": 490.0, "ltp": 450.0, "predictive_open": 435.0},
                {"ticker": "NKE", "exchange": "NASDAQ", "catalyst_core": "Inventory bloat and intense competition from newer brands.", "full_news": "Nike is forced to rely on heavy discounting to clear excess inventory, while brands like On and Hoka steal market share. Margins compressed.", "directional_conviction": "High", "expected_margin_low": -5.0, "expected_margin_high": -10.0, "stop_loss_atr": 4.0, "invalidation_level": 98.0, "ltp": 88.0, "predictive_open": 84.0},
                {"ticker": "ASIANPAINT", "exchange": "NSE", "catalyst_core": "Intensifying competition from new entrant Grasim.", "full_news": "The aggressive launch of Birla Opus is triggering a price war in the decorative paints segment, threatening Asian Paints' pricing power.", "directional_conviction": "Medium", "expected_margin_low": -3.0, "expected_margin_high": -6.0, "stop_loss_atr": 60.0, "invalidation_level": 3100.0, "ltp": 2900.0, "predictive_open": 2840.0},
                {"ticker": "PFE", "exchange": "NASDAQ", "catalyst_core": "Post-COVID revenue cliff steeper than projected.", "full_news": "Pfizer's attempts to pivot to oncology are taking time, while legacy vaccine revenues are plunging faster than analysts modeled this month.", "directional_conviction": "Medium", "expected_margin_low": -2.0, "expected_margin_high": -5.0, "stop_loss_atr": 1.5, "invalidation_level": 30.0, "ltp": 27.50, "predictive_open": 26.50},
                {"ticker": "TCS", "exchange": "NSE", "catalyst_core": "Margin pressure from wage hikes realizing this month.", "full_news": "The impact of the annual wage hike cycle is hitting TCS's P&L this month, causing short-term bearish pressure from institutional sellers.", "directional_conviction": "Low", "expected_margin_low": -1.5, "expected_margin_high": -3.5, "stop_loss_atr": 40.0, "invalidation_level": 3950.0, "ltp": 3800.0, "predictive_open": 3750.0}
            ]
        },
        "1Y": {
            "bullish": [
                {"ticker": "RELIANCE", "exchange": "NSE", "catalyst_core": "Strong Q4 earnings combined with a 1-year bullish trend in new energy.", "full_news": "Reliance's massive gigafactory investments are finally coming online. 1 year of sentiment analysis show an overwhelmingly positive shift in institutional reports.", "directional_conviction": "High", "expected_margin_low": 2.5, "expected_margin_high": 4.0, "stop_loss_atr": 45.5, "invalidation_level": 2800.0, "ltp": 2850.0, "predictive_open": 2885.0},
                {"ticker": "NVDA", "exchange": "NASDAQ", "catalyst_core": "1-year continuous easing of semiconductor supply chain, Blackwell hype.", "full_news": "TSMC confirmed ample CoWoS packaging capacity for NVIDIA's next-gen Blackwell chips. The 1-year vector analysis flags this as a critical inflection point for margins.", "directional_conviction": "High", "expected_margin_low": 4.0, "expected_margin_high": 7.5, "stop_loss_atr": 15.0, "invalidation_level": 115.0, "ltp": 120.0, "predictive_open": 124.0},
                {"ticker": "TCS", "exchange": "NSE", "catalyst_core": "Long-term deal wins accumulating over the 1-year vector window.", "full_news": "TCS announced a $1B+ digital transformation deal in the UK. This adds to a 1-year streak of consistent deal pipelines being finalized.", "directional_conviction": "Medium", "expected_margin_low": 1.0, "expected_margin_high": 2.5, "stop_loss_atr": 30.0, "invalidation_level": 3700.0, "ltp": 3750.0, "predictive_open": 3765.0},
                {"ticker": "AMZN", "exchange": "NASDAQ", "catalyst_core": "Project Kuiper and AWS growth compounding over the 1-year cycle.", "full_news": "Amazon's satellite internet division and accelerating AWS growth have created a solid fundamental floor over the last year.", "directional_conviction": "High", "expected_margin_low": 5.0, "expected_margin_high": 9.0, "stop_loss_atr": 8.0, "invalidation_level": 175.0, "ltp": 185.0, "predictive_open": 192.0},
                {"ticker": "BHARTIARTL", "exchange": "NSE", "catalyst_core": "ARPU expansion solidifying after tariff hikes 1 year ago.", "full_news": "The effects of the recent tariff hikes are fully visible in the 1-year data, with ARPU expanding without significant subscriber churn.", "directional_conviction": "High", "expected_margin_low": 6.0, "expected_margin_high": 10.0, "stop_loss_atr": 20.0, "invalidation_level": 1300.0, "ltp": 1400.0, "predictive_open": 1450.0},
                {"ticker": "AVGO", "exchange": "NASDAQ", "catalyst_core": "Custom AI silicon demand and VMWare synergy realization.", "full_news": "Broadcom's custom ASIC business is booming. The 1-year integration data of VMWare shows better-than-expected cost synergies.", "directional_conviction": "High", "expected_margin_low": 7.0, "expected_margin_high": 12.0, "stop_loss_atr": 40.0, "invalidation_level": 1400.0, "ltp": 1550.0, "predictive_open": 1620.0},
                {"ticker": "LT", "exchange": "NSE", "catalyst_core": "Infrastructure capex execution reaching peak velocity.", "full_news": "L&T's execution speed on domestic infra projects has hit a 1-year high, ensuring strong revenue recognition for the upcoming quarter.", "directional_conviction": "High", "expected_margin_low": 4.0, "expected_margin_high": 8.0, "stop_loss_atr": 60.0, "invalidation_level": 3400.0, "ltp": 3600.0, "predictive_open": 3700.0},
                {"ticker": "GOOGL", "exchange": "NASDAQ", "catalyst_core": "Search monetization stabilizing after initial AI overviews scare.", "full_news": "After a rocky start, Google's AI Overviews are showing stable ad click-through rates over the last year, easing investor anxiety.", "directional_conviction": "Medium", "expected_margin_low": 3.0, "expected_margin_high": 6.0, "stop_loss_atr": 6.0, "invalidation_level": 165.0, "ltp": 175.0, "predictive_open": 180.0},
                {"ticker": "SUNPHARMA", "exchange": "NSE", "catalyst_core": "Specialty portfolio driving US revenue growth consistently.", "full_news": "Prescription data over the last year shows strong market share gains for Sun Pharma's specialty dermatology products in the US.", "directional_conviction": "High", "expected_margin_low": 4.5, "expected_margin_high": 8.5, "stop_loss_atr": 25.0, "invalidation_level": 1450.0, "ltp": 1520.0, "predictive_open": 1560.0},
                {"ticker": "ARM", "exchange": "NASDAQ", "catalyst_core": "Royalty rates increasing on v9 architecture adoption.", "full_news": "Smartphone and PC OEMs rapidly shifting to Arm v9 architecture over the last year is significantly boosting Arm's royalty revenue stream.", "directional_conviction": "High", "expected_margin_low": 8.0, "expected_margin_high": 15.0, "stop_loss_atr": 5.0, "invalidation_level": 105.0, "ltp": 125.0, "predictive_open": 133.0}
            ],
            "bearish": [
                {"ticker": "KOTAKBANK", "exchange": "NSE", "catalyst_core": "Management transition challenges over the 1-year period.", "full_news": "The leadership transition is causing near-term operational friction, leading to a loss of market share in high-yield segments over the 1-year window.", "directional_conviction": "High", "expected_margin_low": -5.0, "expected_margin_high": -10.0, "stop_loss_atr": 35.0, "invalidation_level": 1800.0, "ltp": 1650.0, "predictive_open": 1580.0},
                {"ticker": "INTC", "exchange": "NASDAQ", "catalyst_core": "Server market share loss accelerating.", "full_news": "1-year data confirms AMD is rapidly capturing enterprise data center share at Intel's expense, pressuring Intel's foundry turnaround plans.", "directional_conviction": "High", "expected_margin_low": -6.0, "expected_margin_high": -12.0, "stop_loss_atr": 2.0, "invalidation_level": 34.0, "ltp": 29.0, "predictive_open": 26.50},
                {"ticker": "UPL", "exchange": "NSE", "catalyst_core": "Global agrochemical channel destocking continues.", "full_news": "A 1-year analysis of global supply chains shows excess inventory of agrochemicals, meaning UPL will struggle to regain pricing power soon.", "directional_conviction": "Medium", "expected_margin_low": -4.0, "expected_margin_high": -8.0, "stop_loss_atr": 15.0, "invalidation_level": 550.0, "ltp": 500.0, "predictive_open": 475.0},
                {"ticker": "SNOW", "exchange": "NASDAQ", "catalyst_core": "Consumption growth slowing as customers optimize cloud spend.", "full_news": "Snowflake is facing a 1-year trend of customers aggressively optimizing their data storage and compute spend, leading to revenue misses.", "directional_conviction": "High", "expected_margin_low": -8.0, "expected_margin_high": -15.0, "stop_loss_atr": 8.0, "invalidation_level": 160.0, "ltp": 135.0, "predictive_open": 122.0},
                {"ticker": "PAGEIND", "exchange": "NSE", "catalyst_core": "Premium innerwear segment facing severe down-trading.", "full_news": "Consumers are shifting to cheaper alternatives amid inflation. Page Industries has seen a 1-year decline in volume growth for its premium Jockey brand.", "directional_conviction": "Medium", "expected_margin_low": -3.0, "expected_margin_high": -7.0, "stop_loss_atr": 800.0, "invalidation_level": 38000.0, "ltp": 35500.0, "predictive_open": 34200.0}
            ]
        }
    }

def generate_commodity_data(base_price, volatility, trend, days=100):
    data = []
    current_price = base_price
    
    start_date = datetime.datetime.now() - datetime.timedelta(days=days)
    for i in range(days):
        date_str = (start_date + datetime.timedelta(days=i)).strftime("%Y-%m-%d")
        
        # Add random noise and trend
        change = current_price * (random.uniform(-volatility, volatility) + trend)
        
        open_p = current_price
        close_p = current_price + change
        high_p = max(open_p, close_p) + (current_price * random.uniform(0, volatility))
        low_p = min(open_p, close_p) - (current_price * random.uniform(0, volatility))
        
        data.append({
            "time": date_str,
            "open": round(open_p, 2),
            "high": round(high_p, 2),
            "low": round(low_p, 2),
            "close": round(close_p, 2)
        })
        current_price = close_p
        
    return data

def map_ticker_to_yahoo(ticker: str, exchange: str) -> str:
    if exchange in ["NSE", "BSE"]:
        if ticker == "ZOMATO":
            return "ETERNAL.NS"
        elif ticker in ["LARSEN", "LT"]:
            return "LT.NS"
        elif ticker == "TATAMOTORS":
            return "TMCV.NS"
        else:
            return f"{ticker}.NS"
    else:
        return ticker

def fetch_live_prices(symbols_list):
    """
    Queries Yahoo Finance spark API in batches of 20.
    Returns: {symbol: {'price': latest_price, 'prev_close': previous_close}}
    """
    data_dict = {}
    chunk_size = 20
    headers = {"User-Agent": "Mozilla/5.0"}
    
    for i in range(0, len(symbols_list), chunk_size):
        chunk = symbols_list[i:i+chunk_size]
        encoded_chunk = [urllib.parse.quote(sym) for sym in chunk]
        symbols_str = ",".join(encoded_chunk)
        url = f"https://query1.finance.yahoo.com/v8/finance/spark?symbols={symbols_str}"
        try:
            r = requests.get(url, headers=headers, timeout=5)
            if r.status_code == 200:
                res = r.json()
                for sym, data in res.items():
                    raw_closes = data.get("close")
                    closes = [c for c in raw_closes if c is not None] if raw_closes is not None else []
                    price = None
                    if closes:
                        price = closes[-1]
                    elif "previousClose" in data:
                        price = data["previousClose"]
                    elif "chartPreviousClose" in data:
                        price = data["chartPreviousClose"]
                        
                    prev_close = data.get("previousClose") or data.get("chartPreviousClose") or price
                    if price is not None:
                        data_dict[sym] = {
                            "price": price,
                            "prev_close": prev_close
                        }
        except Exception as e:
            print(f"Error fetching live prices for chunk {chunk}: {e}")
            
    return data_dict

# Short cache lock and store to deduplicate concurrent backend requests
_cache_lock = threading.Lock()
_last_fetch_time = 0.0
_cached_prices = {}

def get_live_prices_cached():
    global _last_fetch_time, _cached_prices
    now = time.time()
    
    with _cache_lock:
        if _cached_prices and (now - _last_fetch_time < 5.0):
            return _cached_prices.copy()
            
    # Collect all unique symbols to query
    symbols = {"GC=F", "SI=F", "CL=F", "USDINR=X"}
    
    try:
        base_picks = get_base_picks()
        for tf in base_picks:
            for direction in ["bullish", "bearish"]:
                for stock in base_picks[tf][direction]:
                    sym = map_ticker_to_yahoo(stock["ticker"], stock["exchange"])
                    symbols.add(sym)
                    
        live_prices = fetch_live_prices(list(symbols))
        
        with _cache_lock:
            _cached_prices = live_prices
            _last_fetch_time = now
            return _cached_prices.copy()
    except Exception as e:
        print(f"Error gathering and caching live prices: {e}")
        return _cached_prices.copy()

def apply_jitter(price: float) -> float:
    """Adds a tiny visual fluctuation (+/- 0.03%) so the UI displays live tick changes on Sync Now."""
    factor = 1.0 + random.uniform(-0.0003, 0.0003)
    return round(price * factor, 2)

def get_mock_picks():
    """Returns stock picks scaled to live prices with a tiny tick jitter."""
    try:
        base_picks = get_base_picks()
        live_prices = get_live_prices_cached()
        
        updated_picks = {}
        for tf, tf_data in base_picks.items():
            updated_picks[tf] = {"bullish": [], "bearish": []}
            for direction in ["bullish", "bearish"]:
                for stock in tf_data[direction]:
                    s = stock.copy()
                    sym = map_ticker_to_yahoo(s["ticker"], s["exchange"])
                    
                    if sym in live_prices:
                        live_ltp = live_prices[sym]["price"]
                        # Apply jitter for active tick visual feedback
                        live_ltp = apply_jitter(live_ltp)
                        
                        mock_ltp = s["ltp"]
                        scale = live_ltp / mock_ltp
                        
                        s["ltp"] = live_ltp
                        s["predictive_open"] = round(s["predictive_open"] * scale, 2)
                        s["invalidation_level"] = round(s["invalidation_level"] * scale, 2)
                        s["stop_loss_atr"] = round(s["stop_loss_atr"] * scale, 2)
                        
                    updated_picks[tf][direction].append(s)
        return updated_picks
    except Exception as e:
        print(f"Error updating picks with live data, falling back to base picks: {e}")
        return get_base_picks()

def get_mock_commodities():
    """Returns commodities mapped to live USD rates and converted to Indian Rupees (INR) with MCX premiums."""
    try:
        live_prices = get_live_prices_cached()
        
        # Extract prices or fall back to baseline values
        gold_usd = live_prices.get("GC=F", {}).get("price", 4238.8)
        prev_gold_usd = live_prices.get("GC=F", {}).get("prev_close", 4114.0)
        
        silver_usd = live_prices.get("SI=F", {}).get("price", 67.974)
        prev_silver_usd = live_prices.get("SI=F", {}).get("prev_close", 64.001)
        
        crude_usd = live_prices.get("CL=F", {}).get("price", 84.88)
        prev_crude_usd = live_prices.get("CL=F", {}).get("prev_close", 87.71)
        
        usdinr = live_prices.get("USDINR=X", {}).get("price", 95.10)
        prev_usdinr = live_prices.get("USDINR=X", {}).get("prev_close", 95.75)
        
        # Convert to MCX INR contract standards
        gold_inr = round((gold_usd * usdinr / 31.1034768) * 10 * 1.16, 2)
        prev_gold_inr = round((prev_gold_usd * prev_usdinr / 31.1034768) * 10 * 1.16, 2)
        
        silver_inr = round(silver_usd * usdinr * 32.1507 * 1.19, 2)
        prev_silver_inr = round(prev_silver_usd * prev_usdinr * 32.1507 * 1.19, 2)
        
        crude_inr = round(crude_usd * usdinr * 1.02, 2)
        prev_crude_inr = round(prev_crude_usd * prev_usdinr * 1.02, 2)
        
        # Apply jitter for active tick visual feedback on refresh/sync
        gold_inr = apply_jitter(gold_inr)
        silver_inr = apply_jitter(silver_inr)
        crude_inr = apply_jitter(crude_inr)
        
        # Calculate rates change and trends
        gold_change = gold_inr - prev_gold_inr
        gold_pct = (gold_change / prev_gold_inr) * 100
        gold_trend = "bullish" if gold_change >= 0 else "bearish"
        
        silver_change = silver_inr - prev_silver_inr
        silver_pct = (silver_change / prev_silver_inr) * 100
        silver_trend = "bullish" if silver_change >= 0 else "bearish"
        
        crude_change = crude_inr - prev_crude_inr
        crude_pct = (crude_change / prev_crude_inr) * 100
        crude_trend = "bullish" if crude_change >= 0 else "bearish"
        
        # Format values
        gold_change_str = f"+{gold_change:.2f}" if gold_change >= 0 else f"{gold_change:.2f}"
        gold_pct_str = f"+{gold_pct:.2f}%" if gold_pct >= 0 else f"{gold_pct:.2f}%"
        
        silver_change_str = f"+{silver_change:.2f}" if silver_change >= 0 else f"{silver_change:.2f}"
        silver_pct_str = f"+{silver_pct:.2f}%" if silver_pct >= 0 else f"{silver_pct:.2f}%"
        
        crude_change_str = f"+{crude_change:.2f}" if crude_change >= 0 else f"{crude_change:.2f}"
        crude_pct_str = f"+{crude_pct:.2f}%" if crude_pct >= 0 else f"{crude_pct:.2f}%"
        
        # Generate predictions dynamically
        if gold_trend == "bullish":
            gold_pred = f"Bullish breakout expected above ₹{int(round(gold_inr * 1.005, -2)):,} resistance within the next 48 hours."
        else:
            gold_pred = f"Bearish slide to test ₹{int(round(gold_inr * 0.995, -2)):,} psychological support level amid weak macro data."
            
        if silver_trend == "bullish":
            silver_pred = f"Bullish breakout expected above ₹{int(round(silver_inr * 1.01, -3)):,} resistance within the next 48 hours."
        else:
            silver_pred = f"Bearish slide to test ₹{int(round(silver_inr * 0.99, -3)):,} psychological support level amid weak macro data."
            
        if crude_trend == "bullish":
            crude_pred = f"Bullish momentum likely to test ₹{int(round(crude_inr * 1.02, -1)):,} resistance levels if supply constraints persist."
        else:
            crude_pred = f"Bearish momentum likely to test ₹{int(round(crude_inr * 0.98, -1)):,} support levels if supply pressure persists."
            
        return {
            "gold": {
                "name": "Gold (MCX INR/10g)",
                "current_price": gold_inr,
                "change": gold_change_str,
                "change_pct": gold_pct_str,
                "trend": gold_trend,
                "catalyst": "Central bank buying from emerging markets remains aggressively high. Safe-haven demand spiking ahead of key geopolitical elections.",
                "prediction": gold_pred,
                "data": {
                    "1D": generate_commodity_data(gold_inr, 0.002, 0.0005, 24),
                    "1W": generate_commodity_data(gold_inr, 0.004, 0.001, 7), 
                    "1M": generate_commodity_data(gold_inr, 0.006, 0.002, 30),
                    "1Y": generate_commodity_data(gold_inr, 0.015, 0.0005, 365)
                }
            },
            "silver": {
                "name": "Silver (MCX INR/1kg)",
                "current_price": silver_inr,
                "change": silver_change_str,
                "change_pct": silver_pct_str,
                "trend": silver_trend,
                "catalyst": "Industrial demand forecast cut by Chinese manufacturers. Solar panel production slowing down due to excessive inventory build-up.",
                "prediction": silver_pred,
                "data": {
                    "1D": generate_commodity_data(silver_inr, 0.005, -0.001, 24),
                    "1W": generate_commodity_data(silver_inr, 0.01, -0.002, 7),
                    "1M": generate_commodity_data(silver_inr, 0.02, 0.001, 30),
                    "1Y": generate_commodity_data(silver_inr, 0.03, 0.001, 365)
                }
            },
            "crude_oil": {
                "name": "Crude Oil (MCX INR/BBL)",
                "current_price": crude_inr,
                "change": crude_change_str,
                "change_pct": crude_pct_str,
                "trend": crude_trend,
                "catalyst": "OPEC+ extends voluntary production cuts into Q4. Geopolitical tensions in the Middle East threatening key supply routes.",
                "prediction": crude_pred,
                "data": {
                    "1D": generate_commodity_data(crude_inr, 0.003, 0.001, 24),
                    "1W": generate_commodity_data(crude_inr, 0.008, 0.002, 7),
                    "1M": generate_commodity_data(crude_inr, 0.015, 0.001, 30),
                    "1Y": generate_commodity_data(crude_inr, 0.02, 0.0005, 365)
                }
            }
        }
    except Exception as e:
        print(f"Error fetching live commodities, returning fallback values: {e}")
        # Default mock fallback to ensure the app never crashes
        return {
            "gold": {
                "name": "Gold (MCX INR/10g)",
                "current_price": 149650.00,
                "change": "+385.00",
                "change_pct": "+0.26%",
                "trend": "bullish",
                "catalyst": "Central bank buying from emerging markets remains aggressively high. Safe-haven demand spiking ahead of key geopolitical elections.",
                "prediction": "Bullish breakout expected above ₹150,500 resistance within the next 48 hours.",
                "data": {
                    "1D": generate_commodity_data(149650, 0.002, 0.0005, 24),
                    "1W": generate_commodity_data(149000, 0.004, 0.001, 7), 
                    "1M": generate_commodity_data(145000, 0.006, 0.002, 30),
                    "1Y": generate_commodity_data(135000, 0.015, 0.0005, 365)
                }
            },
            "silver": {
                "name": "Silver (MCX INR/1kg)",
                "current_price": 247200.00,
                "change": "-1300.00",
                "change_pct": "-0.52%",
                "trend": "bearish",
                "catalyst": "Industrial demand forecast cut by Chinese manufacturers. Solar panel production slowing down due to excessive inventory build-up.",
                "prediction": "Bearish slide to test ₹245,000 psychological support level amid weak macro data.",
                "data": {
                    "1D": generate_commodity_data(247200, 0.005, -0.001, 24),
                    "1W": generate_commodity_data(250000, 0.01, -0.002, 7),
                    "1M": generate_commodity_data(240000, 0.02, 0.001, 30),
                    "1Y": generate_commodity_data(220000, 0.03, 0.001, 365)
                }
            },
            "crude_oil": {
                "name": "Crude Oil (MCX INR/BBL)",
                "current_price": 6620.00,
                "change": "+140.00",
                "change_pct": "+2.15%",
                "trend": "bullish",
                "catalyst": "OPEC+ extends voluntary production cuts into Q4. Geopolitical tensions in the Middle East threatening key supply routes.",
                "prediction": "Bullish momentum likely to test ₹6,800 resistance levels if supply constraints persist.",
                "data": {
                    "1D": generate_commodity_data(6480, 0.003, 0.001, 24),
                    "1W": generate_commodity_data(6550, 0.008, 0.002, 7),
                    "1M": generate_commodity_data(6200, 0.015, 0.001, 30),
                    "1Y": generate_commodity_data(5800, 0.02, 0.0005, 365)
                }
            }
        }
