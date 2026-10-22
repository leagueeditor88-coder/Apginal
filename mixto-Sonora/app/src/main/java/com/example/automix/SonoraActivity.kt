package com.example.automix

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.LinearLayout
import android.widget.TextView
import android.graphics.Color
import androidx.activity.ComponentActivity

/** Sonora UI empaquetada dentro del mismo APK de Mixto. No altera el código fuente original de Sonora. */
class SonoraActivity : ComponentActivity() {
    private var webView: WebView? = null

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.rgb(10, 12, 20))
        }
        val header = TextView(this).apply {
            text = "←  Volver a Mixto"
            textSize = 16f
            setTextColor(Color.WHITE)
            setPadding(24, 18, 16, 18)
            setBackgroundColor(Color.rgb(24, 28, 42))
            setOnClickListener { finish() }
        }
        root.addView(header, LinearLayout.LayoutParams(-1, -2))
        val web = WebView(this).apply {
            setBackgroundColor(Color.rgb(10, 12, 20))
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.allowFileAccess = true
            settings.allowContentAccess = true
            webChromeClient = WebChromeClient()
            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    val uri = request?.url ?: return false
                    return uri.scheme != "file" && uri.scheme != "https" && uri.scheme != "http"
                }
            }
            loadUrl("file:///android_asset/sonora/index.html")
        }
        webView = web
        root.addView(web, LinearLayout.LayoutParams(-1, 0, 1f))
        setContentView(root)
    }

    @Deprecated("Deprecated in Android API")
    override fun onBackPressed() {
        val web = webView
        if (web?.canGoBack() == true) web.goBack() else finish()
    }

    override fun onDestroy() {
        webView?.apply { stopLoading(); loadUrl("about:blank"); destroy() }
        webView = null
        super.onDestroy()
    }
}
