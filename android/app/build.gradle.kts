import java.net.URI

plugins { id("com.android.application") }

val suppliedOrigin = providers.gradleProperty("finscribeOrigin").getOrElse("https://finscribe-ai.vercel.app").trim()
val parsedOrigin = try { URI(suppliedOrigin) } catch (_: Exception) { throw GradleException("finscribeOrigin must be an HTTPS origin.") }
if (!parsedOrigin.scheme.equals("https", ignoreCase = true) || parsedOrigin.host.isNullOrEmpty() || parsedOrigin.userInfo != null || parsedOrigin.query != null || parsedOrigin.fragment != null || parsedOrigin.path !in listOf("", "/") || parsedOrigin.port < -1 || parsedOrigin.port > 65535) {
    throw GradleException("finscribeOrigin must be an HTTPS origin without credentials, paths, or queries.")
}
val origin = "https://${parsedOrigin.host.lowercase()}" + if (parsedOrigin.port !in listOf(-1, 443)) ":${parsedOrigin.port}" else ""
val signingVariables = listOf("FINSCRIBE_KEYSTORE_PATH", "FINSCRIBE_KEYSTORE_PASSWORD", "FINSCRIBE_KEY_ALIAS", "FINSCRIBE_KEY_PASSWORD")
val signingValues = signingVariables.map { providers.environmentVariable(it).orNull }
if (gradle.startParameter.taskNames.any { it.contains("release", ignoreCase = true) } && signingValues.any { it.isNullOrBlank() }) {
    throw GradleException("Release signing requires all four FINSCRIBE_KEYSTORE/KEY environment variables; debug keys are never used for release.")
}
gradle.taskGraph.whenReady {
    if (allTasks.any { it.project == project && it.name in listOf("assembleRelease", "bundleRelease", "packageRelease", "packageReleaseBundle", "signReleaseBundle") } && signingValues.any { it.isNullOrBlank() }) {
        throw GradleException("Release signing requires all four FINSCRIBE_KEYSTORE/KEY environment variables; debug keys are never used for release.")
    }
}

android {
    namespace = "com.finscribe.app"
    compileSdk = 36
    buildToolsVersion = "36.0.0"
    defaultConfig {
        applicationId = "com.finscribe.app"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "0.1.0"
        manifestPlaceholders["launchUrl"] = "$origin/dashboard"
        manifestPlaceholders["appHost"] = parsedOrigin.host.lowercase()
        val statement = """[{"relation":["delegate_permission/common.handle_all_urls"],"target":{"namespace":"web","site":"$origin"}}]"""
        resValue("string", "asset_statements", statement.replace("\"", "\\\""))
    }
    signingConfigs {
        if (signingValues.all { !it.isNullOrBlank() }) {
            create("production") {
                storeFile = file(signingValues[0]!!)
                storePassword = signingValues[1]
                keyAlias = signingValues[2]
                keyPassword = signingValues[3]
            }
        }
    }
    buildTypes {
        release {
            signingConfig = signingConfigs.findByName("production")
            isMinifyEnabled = false
        }
    }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
}
dependencies { implementation("com.google.androidbrowserhelper:androidbrowserhelper:2.6.2") }
