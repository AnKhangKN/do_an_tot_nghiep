import 'package:flutter_background_service/flutter_background_service.dart';
import 'service_handler.dart';

/// =========================
/// ENTRYPOINT ISOLATE
/// =========================
@pragma('vm:entry-point')
void onStart(ServiceInstance service) async {
  final handler = ServiceHandler(service);

  handler.init();

  service.on("stop").listen((event) {
    handler.stop();
  });

  service.on("update_notification").listen(handler.updateNotification);

  service.on("data").listen((event) {
    handler.handleMessage(event);
  });

  handler.start();
}
