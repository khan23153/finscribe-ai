/// Build-time configuration.
///
/// Override the server with:
/// `flutter build apk --dart-define=API_BASE_URL=https://your-domain`
class AppConfig {
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://finscribe-ai.vercel.app',
  );
}
