import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/constants/color_constants.dart';
import '../../../../core/utils/formatters.dart';
import '../providers/app_report_provider.dart';
import '../widgets/app_report_badges.dart';

class AppReportHistoryScreen extends StatefulWidget {
  const AppReportHistoryScreen({super.key});

  @override
  State<AppReportHistoryScreen> createState() => _AppReportHistoryScreenState();
}

class _AppReportHistoryScreenState extends State<AppReportHistoryScreen> {
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    final provider = context.read<AppReportProvider>();
    if (!provider.hasLoaded) {
      provider.fetchMyReports();
    }
    _scrollController.addListener(() {
      if (_scrollController.position.pixels >=
          _scrollController.position.maxScrollExtent - 120) {
        context.read<AppReportProvider>().loadMore();
      }
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppReportProvider>();

    return Scaffold(
      backgroundColor: ColorConstants.backgroundLight,
      appBar: AppBar(
        title: const Text(
          'Lịch sử báo cáo',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: ColorConstants.surfaceWhite,
        foregroundColor: ColorConstants.textPrimary,
        elevation: 0.5,
      ),
      body: RefreshIndicator(
        onRefresh: () => provider.fetchMyReports(),
        child: _buildBody(provider),
      ),
    );
  }

  Widget _buildBody(AppReportProvider provider) {
    if (provider.isLoading && !provider.hasLoaded) {
      return const Center(
        child: CircularProgressIndicator(color: ColorConstants.redRescue),
      );
    }

    if (provider.loadError != null && provider.reports.isEmpty) {
      return _buildEmptyState(
        icon: Icons.cloud_off_rounded,
        message: provider.loadError!,
      );
    }

    if (provider.reports.isEmpty) {
      return _buildEmptyState(
        icon: Icons.inbox_outlined,
        message: 'Bạn chưa gửi báo cáo nào.\nHãy gửi báo cáo đầu tiên của bạn nhé!',
      );
    }

    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(16),
      itemCount: provider.reports.length + 1,
      itemBuilder: (context, index) {
        if (index >= provider.reports.length) {
          if (provider.isLoading) {
            return const Padding(
              padding: EdgeInsets.symmetric(vertical: 20),
              child: Center(
                child: CircularProgressIndicator(color: ColorConstants.redRescue),
              ),
            );
          }
          return const SizedBox(height: 24);
        }
        return _ReportCard(report: provider.reports[index]);
      },
    );
  }

  Widget _buildEmptyState({required IconData icon, required String message}) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: ConstrainedBox(
            constraints: BoxConstraints(minHeight: constraints.maxHeight),
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: ColorConstants.redRescue.withOpacity(0.08),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(icon, size: 40, color: ColorConstants.redRescue),
                  ),
                  const SizedBox(height: 16),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: Text(
                      message,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 14,
                        height: 1.5,
                        color: ColorConstants.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _ReportCard extends StatelessWidget {
  final dynamic report;

  const _ReportCard({required this.report});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ColorConstants.surfaceWhite,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ColorConstants.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  report.title ?? '',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: ColorConstants.textPrimary,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              AppReportStatusBadge(status: report.status ?? 'PENDING'),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            report.content ?? '',
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 13,
              height: 1.4,
              color: ColorConstants.textSecondary,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              AppReportCategoryChip(category: report.category ?? 'OTHER'),
              const Spacer(),
              Icon(
                Icons.schedule_rounded,
                size: 13,
                color: ColorConstants.textMuted,
              ),
              const SizedBox(width: 4),
              Text(
                Formatters.formatDateTime(report.createdAt),
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: ColorConstants.textMuted,
                ),
              ),
            ],
          ),
          if (report.adminNote != null && report.adminNote!.toString().trim().isNotEmpty) ...[
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: ColorConstants.info.withOpacity(0.06),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: ColorConstants.info.withOpacity(0.2)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.admin_panel_settings_outlined,
                        size: 14,
                        color: ColorConstants.info,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'Phản hồi từ quản trị viên',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: ColorConstants.info,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    report.adminNote.toString(),
                    style: TextStyle(
                      fontSize: 12.5,
                      height: 1.4,
                      color: ColorConstants.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
