#include <napi.h>
#import <Cocoa/Cocoa.h>

// Electron's macOS native handle is an NSView*. The view's window is the
// actual NSWindow whose sharing policy must be changed.
Napi::Value SetSharingNone(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() < 1 || !info[0].IsBuffer()) {
    Napi::TypeError::New(env, "Expected Electron native window handle Buffer").ThrowAsJavaScriptException();
    return env.Null();
  }

  auto handle = info[0].As<Napi::Buffer<uint8_t>>();
  NSView *view = nullptr;
  if (handle.Length() >= sizeof(void*)) {
    memcpy(&view, handle.Data(), sizeof(void*));
  }
  NSWindow *window = view ? [view window] : nil;
  if (!window) return Napi::Boolean::New(env, false);

  // Apple API: a window with NSWindowSharingNone is omitted by supported
  // window-sharing/capture clients. This is not a guarantee against every
  // third-party recorder or camera pointed at the display.
  [window setSharingType:NSWindowSharingNone];
  return Napi::Boolean::New(env, true);
}

Napi::Value SetSharingReadOnly(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() < 1 || !info[0].IsBuffer()) return env.Null();
  auto handle = info[0].As<Napi::Buffer<uint8_t>>();
  NSView *view = nullptr;
  if (handle.Length() >= sizeof(void*)) memcpy(&view, handle.Data(), sizeof(void*));
  NSWindow *window = view ? [view window] : nil;
  if (window) [window setSharingType:NSWindowSharingReadOnly];
  return Napi::Boolean::New(env, window != nil);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("setSharingNone", Napi::Function::New(env, SetSharingNone));
  exports.Set("restoreSharing", Napi::Function::New(env, SetSharingReadOnly));
  return exports;
}
NODE_API_MODULE(mac_window, Init)
