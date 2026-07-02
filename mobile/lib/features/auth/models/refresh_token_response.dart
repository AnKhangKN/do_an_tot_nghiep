class RefreshTokenResponse {
  final String? accessToken;

  RefreshTokenResponse({this.accessToken});

  factory RefreshTokenResponse.fromJson(Map<String, dynamic> json) {
    return RefreshTokenResponse(
      accessToken: json['accessToken']
    );
  }
}