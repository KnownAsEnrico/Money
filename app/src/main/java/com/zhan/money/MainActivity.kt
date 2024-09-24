package com.zhan.money

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.*
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main) // Prüfen Sie, ob die Layout-Datei korrekt ist

        // WebView initialisieren
        webView = findViewById(R.id.webView) // Stellen Sie sicher, dass die ID übereinstimmt

        // WebView-Einstellungen konfigurieren
        val webSettings: WebSettings = webView.settings
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true
        webSettings.allowFileAccess = true
        webSettings.databaseEnabled = true
        webSettings.cacheMode = WebSettings.LOAD_DEFAULT

        // Cookies akzeptieren
        CookieManager.getInstance().setAcceptCookie(true)

        // WebViewClient setzen
        webView.webViewClient = WebViewClient()

        // HTML-Datei laden
        webView.loadUrl("file:///android_asset/index.html") // Prüfen Sie den Pfad und die Existenz der Datei
    }
}
