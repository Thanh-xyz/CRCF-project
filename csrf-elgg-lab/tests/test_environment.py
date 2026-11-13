import json
import threading
import unittest
import urllib.error
import urllib.request
import http.server
import exploit


class AttackerServerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), exploit.Handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.url = f'http://127.0.0.1:{cls.server.server_port}'

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def test_static_allowlist_hides_project_and_secrets(self):
        for path in ('/.env', '/../exploit.py', '/lab/seed/elgg.sql', '/docs/x'):
            with self.subTest(path=path), self.assertRaises(urllib.error.HTTPError) as caught:
                urllib.request.urlopen(self.url + path)
            self.assertEqual(caught.exception.code, 404)

    def test_health_and_html(self):
        with urllib.request.urlopen(self.url + '/health') as response:
            self.assertTrue(json.load(response)['ok'])
        with urllib.request.urlopen(self.url) as response:
            self.assertIn('CSRF trên Elgg', response.read().decode())

    def test_echo_preserves_encoding_and_never_returns_cookie(self):
        request = urllib.request.Request(self.url + '/echo',
            data=b'description=CSRF+attack+by+23001939&name=Alice+%26+Group',
            headers={'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': 'Elgg=TEST_ONLY'})
        with urllib.request.urlopen(request) as response:
            result = response.read().decode()
            self.assertNotIn('TEST_ONLY', result)
            self.assertEqual(json.loads(result)['fields']['name'], ['Alice & Group'])

    def test_echo_rejects_secret_fields_and_wrong_content_type(self):
        for content_type, body, code in [
            ('application/json', b'{}', 415),
            ('application/x-www-form-urlencoded', b'__elgg_token=test', 400),
            ('application/x-www-form-urlencoded', b'access_token=test', 400),
            ('application/x-www-form-urlencoded', b'x=' + b'a' * 8192, 413),
        ]:
            request = urllib.request.Request(self.url + '/echo',data=body,headers={'Content-Type':content_type})
            with self.subTest(code=code), self.assertRaises(urllib.error.HTTPError) as caught:
                urllib.request.urlopen(request)
            self.assertEqual(caught.exception.code, code)


if __name__ == '__main__':
    unittest.main()
