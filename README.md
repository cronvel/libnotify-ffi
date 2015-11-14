

# Libnotify

A node module providing low-level access to *libnotify* through node-ffi (Foreign Function Interface), and an higher level API.

Most node library for *libnotify* are in fact spawning a new process and executing the command line utility *notify-send*,
which is super-slow and does not provide all of *libnotify* features, like buttons with action callback.

This module loads the dynamic library (libnotify.so) and provides bindings for its C functions.

Higher level API will be available soon.


