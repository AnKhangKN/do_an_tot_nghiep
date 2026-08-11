import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../shared/widgets/terms_policy_dialog.dart';

class TermsCheckboxWidget extends StatelessWidget {
  final bool value;
  final ValueChanged<bool?> onChanged;

  const TermsCheckboxWidget({
    super.key,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(
            width: 24,
            height: 24,
            child: Checkbox(
              value: value,
              onChanged: onChanged,
              activeColor: ColorConstants.redRescue,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(6),
              ),
              side: BorderSide(
                color: ColorConstants.borderDark,
                width: 1.5,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: RichText(
              text: TextSpan(
                style: TextStyle(
                  fontSize: 13,
                  color: ColorConstants.textMuted,
                  height: 1.4,
                ),
                children: [
                  const TextSpan(text: 'Tôi đồng ý với '),
                  TextSpan(
                    text: 'Điều khoản sử dụng',
                    style: const TextStyle(
                      color: ColorConstants.redRescue,
                      fontWeight: FontWeight.bold,
                      decoration: TextDecoration.underline,
                    ),
                    recognizer: TapGestureRecognizer()
                      ..onTap = () => TermsPolicyDialog.show(context, TermsPolicyType.terms),
                  ),
                  const TextSpan(text: ' và '),
                  TextSpan(
                    text: 'Chính sách bảo mật',
                    style: const TextStyle(
                      color: ColorConstants.redRescue,
                      fontWeight: FontWeight.bold,
                      decoration: TextDecoration.underline,
                    ),
                    recognizer: TapGestureRecognizer()
                      ..onTap = () => TermsPolicyDialog.show(context, TermsPolicyType.privacy),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
