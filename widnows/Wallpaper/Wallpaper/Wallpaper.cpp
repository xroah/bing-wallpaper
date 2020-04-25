#include "pch.h"
#include <stdio.h>
#include <Windows.h>

int main(int argc, char *argv[])
{
	if (argc <= 1) {
		printf("No image provided.\n");

		return 1;
	}
	char *img_path = argv[1];
	wchar_t *w_img_path = 0;
	int len = MultiByteToWideChar(
		CP_ACP,
		0,
		img_path,
		strlen(img_path),
		NULL,
		0
	);
	w_img_path = new wchar_t[len + 1];
	MultiByteToWideChar(
		CP_ACP,
		0,
		img_path,
		strlen(img_path),
		w_img_path,
		len
	);
	w_img_path[len] = '\0';
	bool ret = SystemParametersInfo(
		SPI_SETDESKWALLPAPER,
		0, 
		(LPWSTR)(w_img_path),
		SPIF_SENDCHANGE | SPIF_UPDATEINIFILE
	);
	printf("%ws\n", w_img_path);

	if (ret) {
		printf("Success.\n");

		return 0;
	}

	printf("Failure.\n");

	return 1;
}