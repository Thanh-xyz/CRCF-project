"""Opt-in live infrastructure checks; Python is NOT a browser CSRF test."""
import json
import os
import subprocess
import unittest
import urllib.request


@unittest.skipUnless(os.getenv('RUN_ELGG_LIVE') == '1', 'NOT RUN: requires running Docker Elgg lab')
class LiveTests(unittest.TestCase):
    def test_services_healthy(self):
        output = subprocess.check_output(['docker', 'compose', 'ps', '--format', 'json'], text=True)
        rows = [json.loads(line) for line in output.splitlines() if line.strip()]
        self.assertEqual({row['Service'] for row in rows}, {'db', 'elgg', 'attacker'})
        for row in rows:
            self.assertEqual(row['Health'], 'healthy')

    def test_elgg_responds_without_cors_allowance(self):
        request = urllib.request.Request('http://127.0.0.1:8080/', headers={
            'Host': 'elgg.csrf.localhost:8080', 'Origin': 'http://attacker.csrf.localhost:8000'})
        with urllib.request.urlopen(request, timeout=10) as response:
            self.assertIn('Elgg', response.read().decode())
            self.assertIsNone(response.headers.get('Access-Control-Allow-Origin'))


if __name__ == '__main__':
    unittest.main()
