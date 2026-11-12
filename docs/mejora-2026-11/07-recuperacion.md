# Recuperación de avances — 12 de noviembre de 2026

Base de producción: 3d2af5cd01fd4e89618a0bf88a6890d4b5635209 (PR160). Integra ocho commits remotos hasta efdcb1f4f8f4b0a6726d42270e37763fc8cb8376 desde claude/inspiring-einstein-kix4fx, conservando historial de ambas ramas y CETES11/11.

Los tres commits locales perdidos en el contenedor anterior no se presentan como recuperados por hash. Se reconstruyen desde transcripción visible y código: diagnóstico (no aplicación de poda), doce fichas con procedencia/fechas históricas y privacidad/WhatsApp.

El usuario dio por buena la revisión fiscal para continuar: no se espera una nueva aprobación de contador ni se afirma validación profesional inexistente. Las limitaciones y supuestos de cálculo documentados permanecen.

No se aplica noindex, redirección, eliminación de páginas ni poda del índice. No se envía revisión AdSense. Domicilio y responsable legal pendientes se tratan por separado, sin inventar ni publicar datos privados.

El monitor de CETES en main compara una rama distinta de producción. Su corrección requiere actualizar el workflow que realmente dispara la tarea; modificar solamente una copia en una rama de trabajo no activa esa corrección. No se da por resuelto el issue103 por cambiar el snapshot de producción.

Se amplía el disparador del CI existente a PR/push de claude/cloudflare-pages, sin cambiar permisos, para que producción no quede fuera de las mismas pruebas que main. Chromium local no puede abrir sockets del proceso por restricción del entorno; pruebas gráficas deben verificarse en CI autorizado, nunca contarse como aprobadas por omisión.
