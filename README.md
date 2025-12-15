# 🔐 Telegram TOTP Generator Bot

![GitHub last commit](https://img.shields.io/github/last-commit/yourusername/totp-generator-bot)
![GitHub license](https://img.shields.io/github/license/yourusername/totp-generator-bot)
![Telegram](https://img.shields.io/badge/Telegram-Bot-blue)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)
![Security](https://img.shields.io/badge/Security-A%2B-brightgreen)

A secure, privacy-focused Telegram bot that generates Time-based One-Time Passwords (TOTP) using Base32 secrets. Built with Web Crypto API and deployed on Cloudflare Workers for maximum security and performance.

## ✨ Features

### 🔒 **Security First**
- **No Secret Storage**: Secrets are processed in-memory and never persisted
- **Web Crypto API**: Uses browser-grade cryptographic operations
- **Client-Side Processing**: All crypto happens in the worker environment
- **Secret Masking**: Automatically masks secrets in display

### ⚡ **Instant TOTP Generation**
- **RFC 6238 Compliant**: Standard TOTP implementation
- **6-Digit Codes**: Industry-standard 6-digit output
- **30-Second Refresh**: Automatic code rotation
- **One-Click Refresh**: Inline buttons for instant code updates

### 🎯 **User-Friendly Interface**
- **Inline Keyboards**: Refresh and show/hide secret buttons
- **Real-Time Countdown**: Shows seconds until code expiration
- **Full/Masked Secret Toggle**: View full secret or masked version
- **Command Support**: `/help`, `/about`, `/format` commands

### 🚀 **Technical Excellence**
- **Cloudflare Workers**: Edge computing for low latency
- **Zero Dependencies**: Pure JavaScript implementation
- **Base32 Validation**: Strict input validation
- **Error Handling**: User-friendly error messages

## 📸 Screenshots

### TOTP Generation
