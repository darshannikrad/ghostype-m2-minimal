{
  "targets": [{
    "target_name": "mac_window",
    "sources": ["native/mac_window.mm"],
    "include_dirs": ["<!@(node -p \"require('node-addon-api').include\")"],
    "defines": ["NAPI_DISABLE_CPP_EXCEPTIONS"],
    "cflags!": ["-fno-exceptions"],
    "cflags_cc!": ["-fno-exceptions"],
    "xcode_settings": {
      "CLANG_CXX_LANGUAGE_STANDARD": "c++17",
      "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
      "MACOSX_DEPLOYMENT_TARGET": "11.0"
    },
    "conditions": [["OS=='mac'", {
      "libraries": ["-framework Cocoa"]
    }]]
  }]
}
