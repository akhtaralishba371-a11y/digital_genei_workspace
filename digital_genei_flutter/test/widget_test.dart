import 'package:flutter_test/flutter_test.dart';
import 'package:syncspace/main.dart';

void main() {
  testWidgets('TeamSync Flutter app renders successfully', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const TeamSyncFlutterApp());
    await tester.pump();

    expect(find.text('TeamSync', findRichText: true), findsOneWidget);
  });
}
