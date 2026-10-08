# app/proguard-rules.pro

# Keep Room entities and DAOs
-keep class com.haiershield.data.db.** { *; }

# Keep service classes (referenced by manifest)
-keep class com.haiershield.service.** { *; }

# Keep accessibility service config and patterns
-keep class com.haiershield.util.AdPatterns { *; }
-keep class com.haiershield.data.ShieldStatus { *; }
-keep class com.haiershield.HaierShieldApp { *; }
