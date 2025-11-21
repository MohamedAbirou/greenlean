"""
Load Test Script for ML Service
Tests API endpoints with concurrent requests to identify bottlenecks
"""

import asyncio
import aiohttp
import time
import json
from typing import Dict, List, Any
from datetime import datetime
import statistics

# ML Service configuration
ML_SERVICE_URL = "http://localhost:5000"

# Sample quiz answers for testing
SAMPLE_QUIZ_ANSWERS = {
    "gender": "male",
    "age": 30,
    "height": 180,
    "weight": 85,
    "goal": "lose_weight",
    "targetWeight": 75,
    "activityLevel": "moderate",
    "workoutLocation": "gym",
    "equipment": ["dumbbells", "barbell"],
    "dietaryPreference": "balanced",
    "mealsPerDay": 3,
}


class LoadTester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.results: List[Dict[str, Any]] = []
        self.errors: List[Dict[str, Any]] = []

    async def make_request(
        self, session: aiohttp.ClientSession, endpoint: str, data: Dict[str, Any], request_id: int
    ) -> Dict[str, Any]:
        """Make a single request and record results"""
        start_time = time.time()
        url = f"{self.base_url}{endpoint}"

        try:
            async with session.post(url, json=data, timeout=aiohttp.ClientTimeout(total=120)) as response:
                duration = time.time() - start_time
                status = response.status
                response_data = await response.json() if response.status == 200 else None

                result = {
                    "request_id": request_id,
                    "endpoint": endpoint,
                    "status": status,
                    "duration": duration,
                    "success": status == 200,
                    "timestamp": datetime.now().isoformat(),
                }

                if status == 200:
                    self.results.append(result)
                else:
                    error_msg = await response.text()
                    result["error"] = error_msg
                    self.errors.append(result)

                return result

        except asyncio.TimeoutError:
            duration = time.time() - start_time
            result = {
                "request_id": request_id,
                "endpoint": endpoint,
                "status": 0,
                "duration": duration,
                "success": False,
                "error": "Timeout (120s)",
                "timestamp": datetime.now().isoformat(),
            }
            self.errors.append(result)
            return result

        except Exception as e:
            duration = time.time() - start_time
            result = {
                "request_id": request_id,
                "endpoint": endpoint,
                "status": 0,
                "duration": duration,
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
            }
            self.errors.append(result)
            return result

    async def run_concurrent_requests(
        self, endpoint: str, data: Dict[str, Any], num_requests: int
    ) -> Dict[str, Any]:
        """Run multiple concurrent requests"""
        print(f"\n{'='*80}")
        print(f"Testing: {endpoint}")
        print(f"Concurrent Requests: {num_requests}")
        print(f"{'='*80}\n")

        async with aiohttp.ClientSession() as session:
            # Create tasks for all requests
            tasks = [
                self.make_request(session, endpoint, data, i + 1) for i in range(num_requests)
            ]

            # Execute all tasks concurrently
            start_time = time.time()
            results = await asyncio.gather(*tasks, return_exceptions=True)
            total_duration = time.time() - start_time

        # Calculate statistics
        successful_requests = [r for r in results if isinstance(r, dict) and r["success"]]
        failed_requests = [r for r in results if isinstance(r, dict) and not r["success"]]

        durations = [r["duration"] for r in successful_requests if "duration" in r]

        stats = {
            "endpoint": endpoint,
            "total_requests": num_requests,
            "successful_requests": len(successful_requests),
            "failed_requests": len(failed_requests),
            "success_rate": (len(successful_requests) / num_requests) * 100,
            "total_duration": total_duration,
            "requests_per_second": num_requests / total_duration if total_duration > 0 else 0,
        }

        if durations:
            stats.update(
                {
                    "avg_response_time": statistics.mean(durations),
                    "min_response_time": min(durations),
                    "max_response_time": max(durations),
                    "median_response_time": statistics.median(durations),
                    "std_dev_response_time": statistics.stdev(durations) if len(durations) > 1 else 0,
                }
            )

        return stats

    def print_results(self, stats: Dict[str, Any]):
        """Print test results in a formatted way"""
        print(f"\n{'='*80}")
        print("LOAD TEST RESULTS")
        print(f"{'='*80}")
        print(f"\nEndpoint: {stats['endpoint']}")
        print(f"\n📊 Request Summary:")
        print(f"  Total Requests:      {stats['total_requests']}")
        print(f"  Successful:          {stats['successful_requests']} ({stats['success_rate']:.1f}%)")
        print(f"  Failed:              {stats['failed_requests']}")
        print(f"\n⏱️  Performance Metrics:")
        print(f"  Total Duration:      {stats['total_duration']:.2f}s")
        print(f"  Requests/Second:     {stats['requests_per_second']:.2f}")

        if "avg_response_time" in stats:
            print(f"\n📈 Response Times:")
            print(f"  Average:             {stats['avg_response_time']:.2f}s")
            print(f"  Median:              {stats['median_response_time']:.2f}s")
            print(f"  Min:                 {stats['min_response_time']:.2f}s")
            print(f"  Max:                 {stats['max_response_time']:.2f}s")
            print(f"  Std Deviation:       {stats['std_dev_response_time']:.2f}s")

        # Show error breakdown if any
        if self.errors:
            print(f"\n❌ Error Breakdown:")
            error_types = {}
            for error in self.errors:
                error_msg = error.get("error", "Unknown error")
                error_types[error_msg] = error_types.get(error_msg, 0) + 1

            for error_msg, count in error_types.items():
                print(f"  {error_msg}: {count}")

        print(f"\n{'='*80}\n")

    def save_results(self, filename: str, stats: Dict[str, Any]):
        """Save results to JSON file"""
        output = {
            "timestamp": datetime.now().isoformat(),
            "statistics": stats,
            "successful_requests": self.results,
            "failed_requests": self.errors,
        }

        with open(filename, "w") as f:
            json.dump(output, f, indent=2)

        print(f"📁 Results saved to: {filename}")


async def test_health_endpoint(num_requests: int = 100):
    """Test /health endpoint"""
    print("\n🏥 Testing Health Endpoint")
    tester = LoadTester(ML_SERVICE_URL)

    stats = await tester.run_concurrent_requests("/health", {}, num_requests)
    tester.print_results(stats)
    tester.save_results("load_test_health_results.json", stats)

    return stats


async def test_meal_plan_generation(num_requests: int = 10):
    """Test /generate-meal-plan endpoint"""
    print("\n🍽️  Testing Meal Plan Generation")
    tester = LoadTester(ML_SERVICE_URL)

    data = {"quiz_answers": SAMPLE_QUIZ_ANSWERS}

    stats = await tester.run_concurrent_requests("/generate-meal-plan", data, num_requests)
    tester.print_results(stats)
    tester.save_results("load_test_meal_plan_results.json", stats)

    return stats


async def test_workout_plan_generation(num_requests: int = 10):
    """Test /generate-workout-plan endpoint"""
    print("\n💪 Testing Workout Plan Generation")
    tester = LoadTester(ML_SERVICE_URL)

    data = {"quiz_answers": SAMPLE_QUIZ_ANSWERS}

    stats = await tester.run_concurrent_requests("/generate-workout-plan", data, num_requests)
    tester.print_results(stats)
    tester.save_results("load_test_workout_plan_results.json", stats)

    return stats


async def test_rate_limiting(num_requests: int = 20):
    """Test rate limiting (should fail after 5 requests/minute)"""
    print("\n🚦 Testing Rate Limiting")
    tester = LoadTester(ML_SERVICE_URL)

    # Send requests rapidly to trigger rate limit
    data = {"quiz_answers": SAMPLE_QUIZ_ANSWERS}

    stats = await tester.run_concurrent_requests("/generate-meal-plan", data, num_requests)
    tester.print_results(stats)

    # Count rate limit errors
    rate_limit_errors = sum(
        1 for error in tester.errors if error.get("status") == 429
    )

    print(f"\n📊 Rate Limiting Analysis:")
    print(f"  Rate limit errors: {rate_limit_errors}/{num_requests}")
    print(f"  Expected: >15 (limit is 5 req/min)")

    return stats


async def run_full_load_test():
    """Run comprehensive load test suite"""
    print("\n" + "=" * 80)
    print("🚀 GREENLEAN ML SERVICE LOAD TEST")
    print("=" * 80)
    print(f"\nTarget: {ML_SERVICE_URL}")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    all_stats = {}

    # Test 1: Health endpoint (fast, many requests)
    print("\n\n--- TEST 1: HEALTH ENDPOINT ---")
    all_stats["health"] = await test_health_endpoint(num_requests=100)

    # Test 2: Meal plan generation (slower, fewer requests)
    print("\n\n--- TEST 2: MEAL PLAN GENERATION ---")
    all_stats["meal_plan"] = await test_meal_plan_generation(num_requests=10)

    # Wait to avoid rate limiting between tests
    print("\n⏳ Waiting 60s to reset rate limit...")
    await asyncio.sleep(60)

    # Test 3: Workout plan generation
    print("\n\n--- TEST 3: WORKOUT PLAN GENERATION ---")
    all_stats["workout_plan"] = await test_workout_plan_generation(num_requests=10)

    # Wait to avoid rate limiting between tests
    print("\n⏳ Waiting 60s to reset rate limit...")
    await asyncio.sleep(60)

    # Test 4: Rate limiting
    print("\n\n--- TEST 4: RATE LIMITING ---")
    all_stats["rate_limiting"] = await test_rate_limiting(num_requests=20)

    # Summary
    print("\n\n" + "=" * 80)
    print("📊 LOAD TEST SUMMARY")
    print("=" * 80)

    for test_name, stats in all_stats.items():
        print(f"\n{test_name.upper()}:")
        print(f"  Success Rate: {stats['success_rate']:.1f}%")
        print(f"  Requests/Sec: {stats['requests_per_second']:.2f}")
        if "avg_response_time" in stats:
            print(f"  Avg Response: {stats['avg_response_time']:.2f}s")

    print("\n" + "=" * 80)
    print(f"Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80 + "\n")


async def quick_test():
    """Quick test with fewer requests for development"""
    print("\n🏃 Running Quick Test (5 requests each)")
    print("=" * 80)

    all_stats = {}

    # Health check (fast)
    print("\n1. Health Check:")
    tester = LoadTester(ML_SERVICE_URL)
    all_stats["health"] = await tester.run_concurrent_requests("/health", {}, 5)
    tester.print_results(all_stats["health"])

    # Meal plan (slower)
    print("\n2. Meal Plan Generation:")
    tester = LoadTester(ML_SERVICE_URL)
    data = {"quiz_answers": SAMPLE_QUIZ_ANSWERS}
    all_stats["meal_plan"] = await tester.run_concurrent_requests(
        "/generate-meal-plan", data, 5
    )
    tester.print_results(all_stats["meal_plan"])

    print("\n✅ Quick test complete!")


def print_usage():
    """Print usage instructions"""
    print("\n" + "=" * 80)
    print("ML SERVICE LOAD TEST - USAGE")
    print("=" * 80)
    print("\nMake sure ML service is running:")
    print("  cd ml_service")
    print("  python app.py")
    print("\nThen run load tests:")
    print("\n  python load_test.py                    # Full test suite")
    print("  python load_test.py --quick            # Quick test (5 requests)")
    print("  python load_test.py --health 100       # Test health endpoint")
    print("  python load_test.py --meal-plan 10     # Test meal plan generation")
    print("  python load_test.py --workout-plan 10  # Test workout plan generation")
    print("  python load_test.py --rate-limit 20    # Test rate limiting")
    print("\n" + "=" * 80 + "\n")


if __name__ == "__main__":
    import sys

    if len(sys.argv) == 1:
        # Run full test suite
        asyncio.run(run_full_load_test())
    elif "--quick" in sys.argv:
        asyncio.run(quick_test())
    elif "--health" in sys.argv:
        idx = sys.argv.index("--health")
        num_requests = int(sys.argv[idx + 1]) if len(sys.argv) > idx + 1 else 100
        asyncio.run(test_health_endpoint(num_requests))
    elif "--meal-plan" in sys.argv:
        idx = sys.argv.index("--meal-plan")
        num_requests = int(sys.argv[idx + 1]) if len(sys.argv) > idx + 1 else 10
        asyncio.run(test_meal_plan_generation(num_requests))
    elif "--workout-plan" in sys.argv:
        idx = sys.argv.index("--workout-plan")
        num_requests = int(sys.argv[idx + 1]) if len(sys.argv) > idx + 1 else 10
        asyncio.run(test_workout_plan_generation(num_requests))
    elif "--rate-limit" in sys.argv:
        idx = sys.argv.index("--rate-limit")
        num_requests = int(sys.argv[idx + 1]) if len(sys.argv) > idx + 1 else 20
        asyncio.run(test_rate_limiting(num_requests))
    elif "--help" in sys.argv or "-h" in sys.argv:
        print_usage()
    else:
        print("❌ Invalid arguments")
        print_usage()
