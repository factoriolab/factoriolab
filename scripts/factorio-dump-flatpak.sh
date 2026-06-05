flatpak run --command=.local/share/Steam/steamapps/common/Factorio/bin/x64/factorio \
    com.valvesoftware.Steam --dump-data
flatpak run --command=.local/share/Steam/steamapps/common/Factorio/bin/x64/factorio \
    com.valvesoftware.Steam --dump-prototype-locale
flatpak run com.valvesoftware.Steam -applaunch 427520 --dump-icon-sprites