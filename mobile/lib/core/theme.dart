import 'package:flutter/material.dart';

/// Colour tokens shared with the web app (src/app/globals.css).
@immutable
class AppColors extends ThemeExtension<AppColors> {
  const AppColors({
    required this.background,
    required this.surface,
    required this.surface2,
    required this.border,
    required this.borderStrong,
    required this.foreground,
    required this.foreground2,
    required this.muted,
    required this.subtle,
    required this.accent,
    required this.accentForeground,
    required this.accentSoft,
    required this.positive,
    required this.negative,
    required this.negativeSoft,
    required this.warning,
    required this.warningSoft,
  });

  final Color background;
  final Color surface;
  final Color surface2;
  final Color border;
  final Color borderStrong;
  final Color foreground;
  final Color foreground2;
  final Color muted;
  final Color subtle;
  final Color accent;
  final Color accentForeground;
  final Color accentSoft;
  final Color positive;
  final Color negative;
  final Color negativeSoft;
  final Color warning;
  final Color warningSoft;

  static const light = AppColors(
    background: Color(0xFFF6F6F3),
    surface: Color(0xFFFFFFFF),
    surface2: Color(0xFFF0F0EC),
    border: Color(0xFFE3E3DD),
    borderStrong: Color(0xFFCDCDC5),
    foreground: Color(0xFF141513),
    foreground2: Color(0xFF3E413C),
    muted: Color(0xFF6B6E68),
    subtle: Color(0xFF9B9E97),
    accent: Color(0xFF1C6B4C),
    accentForeground: Color(0xFFFFFFFF),
    accentSoft: Color(0xFFE5EFE9),
    positive: Color(0xFF1B7647),
    negative: Color(0xFFB4321F),
    negativeSoft: Color(0xFFFBECE9),
    warning: Color(0xFF94590A),
    warningSoft: Color(0xFFFBF1DF),
  );

  static const dark = AppColors(
    background: Color(0xFF0D0E0D),
    surface: Color(0xFF151615),
    surface2: Color(0xFF1C1E1C),
    border: Color(0xFF262825),
    borderStrong: Color(0xFF363935),
    foreground: Color(0xFFECECE8),
    foreground2: Color(0xFFC3C5BF),
    muted: Color(0xFF8E918A),
    subtle: Color(0xFF63665F),
    accent: Color(0xFF4BB386),
    accentForeground: Color(0xFF07130D),
    accentSoft: Color(0x1F4BB386),
    positive: Color(0xFF5CC392),
    negative: Color(0xFFEF7466),
    negativeSoft: Color(0x1FEF7466),
    warning: Color(0xFFE0A650),
    warningSoft: Color(0x1FE0A650),
  );

  @override
  AppColors copyWith() => this;

  @override
  AppColors lerp(ThemeExtension<AppColors>? other, double t) =>
      other is AppColors && t >= 0.5 ? other : this;
}

extension AppColorsX on BuildContext {
  AppColors get colors => Theme.of(this).extension<AppColors>()!;
}

const tabularFigures = [FontFeature.tabularFigures()];

ThemeData buildTheme(Brightness brightness) {
  final c = brightness == Brightness.dark ? AppColors.dark : AppColors.light;
  final base = ThemeData(brightness: brightness, useMaterial3: true, fontFamily: 'Roboto');

  final textTheme = base.textTheme
      .apply(bodyColor: c.foreground, displayColor: c.foreground)
      .copyWith(
        headlineSmall: base.textTheme.headlineSmall?.copyWith(
          fontSize: 24,
          fontWeight: FontWeight.w600,
          letterSpacing: -0.4,
          color: c.foreground,
        ),
        titleMedium: base.textTheme.titleMedium?.copyWith(
          fontSize: 15,
          fontWeight: FontWeight.w600,
          color: c.foreground,
        ),
        bodyMedium: base.textTheme.bodyMedium?.copyWith(fontSize: 14, color: c.foreground2, height: 1.45),
        bodySmall: base.textTheme.bodySmall?.copyWith(fontSize: 12.5, color: c.muted),
        labelLarge: base.textTheme.labelLarge?.copyWith(fontSize: 14, fontWeight: FontWeight.w600),
      );

  final radius = BorderRadius.circular(10);
  OutlineInputBorder outline(Color color, [double width = 1]) =>
      OutlineInputBorder(borderRadius: radius, borderSide: BorderSide(color: color, width: width));

  return base.copyWith(
    extensions: [c],
    scaffoldBackgroundColor: c.background,
    colorScheme: ColorScheme.fromSeed(
      seedColor: c.accent,
      brightness: brightness,
      primary: c.accent,
      onPrimary: c.accentForeground,
      surface: c.surface,
      onSurface: c.foreground,
      error: c.negative,
    ),
    textTheme: textTheme,
    dividerTheme: DividerThemeData(color: c.border, thickness: 1, space: 1),
    appBarTheme: AppBarTheme(
      backgroundColor: c.background,
      foregroundColor: c.foreground,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: false,
      titleTextStyle: textTheme.titleMedium?.copyWith(fontSize: 17),
      shape: Border(bottom: BorderSide(color: c.border)),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: c.surface,
      surfaceTintColor: Colors.transparent,
      indicatorColor: c.accentSoft,
      height: 68,
      labelTextStyle: WidgetStateProperty.resolveWith(
        (states) => TextStyle(
          fontSize: 11.5,
          fontWeight: FontWeight.w500,
          color: states.contains(WidgetState.selected) ? c.foreground : c.muted,
        ),
      ),
      iconTheme: WidgetStateProperty.resolveWith(
        (states) => IconThemeData(
          size: 22,
          color: states.contains(WidgetState.selected) ? c.accent : c.muted,
        ),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: c.accent,
        foregroundColor: c.accentForeground,
        minimumSize: const Size(0, 46),
        shape: RoundedRectangleBorder(borderRadius: radius),
        textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: c.foreground,
        minimumSize: const Size(0, 46),
        side: BorderSide(color: c.border),
        shape: RoundedRectangleBorder(borderRadius: radius),
        textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: c.accent,
        textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: c.surface,
      isDense: true,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      hintStyle: TextStyle(color: c.subtle),
      labelStyle: TextStyle(color: c.foreground2),
      floatingLabelBehavior: FloatingLabelBehavior.always,
      border: outline(c.border),
      enabledBorder: outline(c.border),
      focusedBorder: outline(c.accent, 1.5),
      errorBorder: outline(c.negative),
      focusedErrorBorder: outline(c.negative, 1.5),
    ),
    segmentedButtonTheme: SegmentedButtonThemeData(
      style: ButtonStyle(
        visualDensity: VisualDensity.compact,
        side: WidgetStatePropertyAll(BorderSide(color: c.border)),
        backgroundColor: WidgetStateProperty.resolveWith(
          (s) => s.contains(WidgetState.selected) ? c.surface : c.surface2,
        ),
        foregroundColor: WidgetStateProperty.resolveWith(
          (s) => s.contains(WidgetState.selected) ? c.foreground : c.muted,
        ),
        textStyle: const WidgetStatePropertyAll(TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
      ),
    ),
    bottomSheetTheme: BottomSheetThemeData(
      backgroundColor: c.surface,
      surfaceTintColor: Colors.transparent,
      showDragHandle: true,
      dragHandleColor: c.borderStrong,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(18))),
    ),
    switchTheme: SwitchThemeData(
      thumbColor: const WidgetStatePropertyAll(Colors.white),
      trackColor: WidgetStateProperty.resolveWith(
        (s) => s.contains(WidgetState.selected) ? c.accent : c.borderStrong,
      ),
      trackOutlineColor: const WidgetStatePropertyAll(Colors.transparent),
    ),
    snackBarTheme: SnackBarThemeData(
      behavior: SnackBarBehavior.floating,
      backgroundColor: c.foreground,
      contentTextStyle: TextStyle(color: c.background),
    ),
    progressIndicatorTheme: ProgressIndicatorThemeData(color: c.accent),
    chipTheme: ChipThemeData(
      backgroundColor: c.surface,
      selectedColor: c.accentSoft,
      surfaceTintColor: Colors.transparent,
      side: BorderSide(color: c.border),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
    ),
    sliderTheme: SliderThemeData(
      padding: const EdgeInsets.symmetric(vertical: 14),
      activeTrackColor: c.accent,
      inactiveTrackColor: c.surface2,
      thumbColor: c.accent,
    ),
    listTileTheme: ListTileThemeData(iconColor: c.muted, textColor: c.foreground),
  );
}
