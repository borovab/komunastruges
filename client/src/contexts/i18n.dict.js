export const COMMON_SQ = {
  back: "Kthehu",
  cancel: "Anulo",
  refresh: "Rifresko",
  loading: "Loading…",
  errorGeneric: "Gabim",
  close: "Mbyll",
  ellipsis: "...",
  errors: { generic: "Gabim" },
};

export const COMMON_MK = {
  back: "Назад",
  cancel: "Откажи",
  refresh: "Освежи",
  loading: "Се вчитува…",
  errorGeneric: "Грешка",
  close: "Затвори",
  ellipsis: "...",
  errors: { generic: "Грешка" },
};

export const DICT = {
  sq: {
    langName: "Shqip",
    toggleLabel: "Gjuha",
    common: COMMON_SQ,

    adminAddUser: {
      title: "Shto përdorues",
      subtitle: "Krijo vetëm llogari User (me departament).",
      cardTitle: "Shto përdorues",
      cardNote: "Vetëm User",
      fields: {
        fullName: { label: "Emri dhe mbiemri", placeholder: "p.sh. John Doe" },
        username: {
          label: "Username",
          placeholder: "p.sh. johndoe",
          help: "Pa hapësira. Minimum 3 karaktere.",
        },
        department: {
          label: "Departamenti",
          loading: "Duke i ngarkuar…",
          empty: "S’ka departamente",
          refreshTitle: "Rifresko departamentet",
        },
        password: { label: "Password", placeholder: "Minimum 6 karaktere" },
        confirmPassword: {
          label: "Konfirmo password",
          placeholder: "Shkruaje përsëri",
        },
      },
      actions: { create: "Krijo përdorues", creating: "Duke krijuar..." },
      ok: { userCreated: "Përdoruesi u krijua me sukses." },
      errors: {
        depsFetchFail: "Nuk u arrit me i marrë departamentet.",
        fullNameRequired: "Shkruaj emrin dhe mbiemrin.",
        usernameRequired: "Shkruaj username.",
        usernameMin3: "Username duhet të ketë të paktën 3 karaktere.",
        departmentRequired: "Zgjidh departamentin.",
        passwordRequired: "Shkruaj password.",
        passwordMin6: "Password duhet të ketë të paktën 6 karaktere.",
        passwordMismatch: "Password-at nuk përputhen.",
        createFail: "Gabim gjatë krijimit të përdoruesit.",
      },
    },

    adminDashboard: {
      headerTitle: "Admin • Panel",
      headerSubtitle: "Statistika + raportet e fundit.",
      export: {
        button: "Eksporto (Excel)",
        title: "Eksporto raportet",
        noReportsTitle: "S’ka raporte për eksport",
      },
      ok: {
        workerAdded: "Punëtori u shtua me sukses.",
        reportReviewed: "Raporti u shënua si reviewed.",
      },
      stats: {
        totalReports: "Raporte totale",
        today: "Sot: {n}",
        pending: "Pending",
        pendingSub: "Raporte pa review",
        reviewed: "Reviewed",
        reviewedSub: "Raporte të verifikuara",
        workers: "Punëtorë",
      },
      chart: {
        title: "Raporte (7 ditët e fundit)",
        maxPerDay: "Max/ditë: {n}",
      },
      list: {
        title: "Të gjitha raportet",
        empty: "S’ka raporte.",
      },
      status: {
        reviewed: "verifikuar",
        pending: "në pritje",
      },
      actions: {
        verify: "Verifikoje.",
      },
      verifiedAt: "Verifikuar: {date}",
      csv: {
        filePrefix: "raportet",
        name: "Emri",
        status: "Statusi",
        date: "Data",
        timeOut: "Ora e daljes",
        timeReturn: "Ora e kthimit",
        department: "Drejtoria/Sektori",
        reason: "Arsyeja",
        created: "Krijuar",
        reviewed: "Reviewed",
      },
    },

    adminDepartments: {
      title: "Departamentet",
      subtitle: "Lista e departamenteve + statistika (punëtorë & raporte).",
      list: {
        title: "Lista",
        total: "Totali",
        empty: "S’ka departamente.",
      },
      badges: {
        workers: "{n} punëtorë",
        reports: "{n} raporte",
      },
      details: {
        title: "Detajet",
        hint: "Kliko një departament për të parë statistikat.",
        pickFromLeft: "Zgjidh një departament nga lista majtas.",
      },
      cards: {
        workersTitle: "Punëtorë",
        workersSub: "në këtë departament",
        reportsTitle: "Raporte",
        reportsSub: "të dërguara",
      },
      workersList: {
        title: "Punëtorët",
        empty: "S’ka punëtorë.",
      },
    },

    adminProfile: {
      title: "Profili (Admin)",
      subtitle: "Përditëso të dhënat dhe sigurinë e llogarisë.",
      meta: {
        id: "ID",
        created: "Krijuar",
      },
      sections: {
        data: {
          title: "Të dhënat",
          subtitle: "Ndrysho emrin dhe username-in.",
        },
        security: {
          title: "Siguria",
          subtitle: "Ndrysho password-in.",
        },
      },
      fields: {
        fullName: {
          label: "Emri dhe mbiemri",
          placeholder: "p.sh. Beqir Borova",
        },
        username: { label: "Username", placeholder: "p.sh. u_admin" },
        currentPassword: { label: "Password aktual" },
        newPassword: { label: "Password i ri" },
        repeatPassword: { label: "Përsërite password-in" },
      },
      actions: {
        saving: "Duke ruajtur...",
        saveChanges: "Ruaj ndryshimet",
        changing: "Duke ndryshuar...",
        changePassword: "Ndrysho password",
      },
      ok: {
        profileUpdated: "Profili u përditësua.",
        passwordChanged: "Password-i u ndryshua me sukses.",
      },
      errors: {
        fullNameRequired: "Shkruaj emrin dhe mbiemrin.",
        usernameRequired: "Shkruaj username.",
        currentPasswordRequired: "Shkruaj password-in aktual.",
        newPasswordRequired: "Shkruaj password-in e ri.",
        newPasswordMin6: "Password-i i ri duhet të ketë së paku 6 karaktere.",
        newPasswordMismatch: "Password-i i ri nuk përputhet.",
      },
    },

    adminReports: {
      headerTitle: "Admin • Raportimet",
      headerSubtitle: "Shfaq të gjitha raportimet (Excel list).",
      filter: {
        allDepartments: "Të gjitha departamentet",
        departmentPrefix: "Departamenti: {name}",
        label: "Filtro:",
        allOption: "Të gjitha",
      },
      list: {
        title: "Lista e raportimeve",
        count: "{n} raportime",
        filteredSuffix: " (filtruar)",
        empty: "S’ka raportime.",
      },
      table: {
        worker: "Punëtori",
        date: "Data",
        timeOut: "Time out",
        timeReturn: "Time return",
        reason: "Arsye",
        status: "Status",
        department: "Departamenti",
        created: "Krijuar",
        actions: "Veprime",
        clickForDetails: "Kliko për detaje",
      },
      actions: {
        dashboard: "Paneli",
        verify: "Verifikoje",
        verified: "Verified",
      },
      ok: {
        verified: "Raportimi u verifikua.",
      },
      modal: {
        status: "Status",
        worker: "Punëtori",
        department: "Departamenti",
        date: "Data",
        time: "Koha",
        reason: "Arsye",
      },
    },

    adminWorkers: {
      headerTitle: "Admin • Punëtorët",
      headerSubtitle: "Lista e punëtorëve (vetëm shfaqje).",
      actions: {
        dashboard: "Paneli",
      },
      filter: {
        allDepartments: "Të gjitha departamentet",
        departmentPrefix: "Departamenti: {name}",
        label: "Filtro:",
        allOption: "Të gjitha",
      },
      list: {
        title: "Lista e përdoruesve",
        count: "{n} përdorues",
        filteredSuffix: " (filtruar)",
        empty: "S’ka përdorues.",
      },
      labels: {
        created: "Krijuar",
        noDepartment: "pa department",
      },
    },

    managerAddUser: {
      headerTitle: "Manager • Shto punëtor",
      headerSubtitle: "Krijo punëtor vetëm për departamentin tënd.",
      form: {
        fullName: "Emri dhe mbiemri",
        username: "Username",
        password: "Password",
      },
      placeholders: {
        fullName: "p.sh. Arben X",
        username: "p.sh. arben",
        password: "min 6",
      },
      actions: {
        addWorker: "Shto punëtor",
      },
      ok: {
        added: "Punëtori u shtua.",
      },
      errors: {
        noDepartmentId: "Manager-i nuk ka departmentId. Kontrollo user session.",
        fillAll: "Plotëso fullName, username, password.",
        passwordTooShort: "Password shumë i shkurtër (min 6).",
      },
    },

    managerDashboard: {
      headerTitle: "Manager • Panel",
      headerSubtitle: "Statistika + raportet e departamentit.",
      actions: {
        refresh: "Rifresko",
      },
      alerts: {
        loading: "Loading…",
      },
      stats: {
        totalReports: {
          title: "Raporte totale",
          subToday: "Sot: {n}",
        },
        pending: {
          title: "Pending",
          sub: "Pa review",
        },
        reviewed: {
          title: "Reviewed",
          sub: "Të verifikuara",
        },
        workers: {
          title: "Punëtorë",
          sub: "Departamenti yt",
        },
      },
      chart: {
        title: "Raporte (7 ditët e fundit)",
        maxPerDay: "Max/ditë: {n}",
      },
      latest: {
        title: "Raportet e fundit",
        empty: "S’ka raporte.",
      },
      status: {
        reviewed: "reviewed",
        pending: "pending",
      },
    },

    managerProfile: {
      headerTitle: "Manager • Profili im",
      headerSubtitle: "Ndrysho emrin dhe password-in.",
      form: {
        fullName: "Emri dhe mbiemri",
        username: "Username",
        newPassword: "Password i ri",
        confirmPassword: "Përsërite password-in",
      },
      placeholders: {
        fullName: "p.sh. Arben X",
        password: "••••••••",
      },
      hints: {
        usernameReadonly: "Username nuk ndryshohet këtu.",
      },
      actions: {
        logout: "Logout",
        refresh: "Rifresko",
        save: "Ruaj",
        saving: "Duke ruajtur...",
      },
      ok: {
        saved: "U ruajt profili.",
      },
      errors: {
        fullNameRequired: "Plotëso emrin dhe mbiemrin.",
        passwordTooShort: "Password shumë i shkurtër (min 6).",
        passwordMismatch: "Password-at nuk përputhen.",
      },
    },

    managerReports: {
      headerTitle: "Manager • Raportimet",
      headerSubtitle: "Shfaq raportimet e punëtorëve të departamentit tënd.",
      actions: {
        addReport: "Shto raport",
        refresh: "Rifresko",
        close: "Mbyll",
        verify: "Verifikoje",
        verified: "Verified",
        sending: "Duke dërguar…",
        sendReport: "Dërgo raportin",
      },
      ok: {
        verified: "Raportimi u verifikua.",
        sent: "Raporti u dërgua me sukses.",
      },
      empty: {
        noReports: "S’ka raportime.",
      },
      list: {
        title: "Lista e raportimeve",
        count: "{n} raportime",
      },
      table: {
        index: "#",
        worker: "Punëtori",
        date: "Data",
        timeOut: "Time out",
        timeReturn: "Time return",
        reason: "Arsye",
        report: "Raport",
        status: "Status",
        department: "Departamenti",
        created: "Krijuar",
        actions: "Veprime",
        clickForDetails: "Kliko për detaje",
      },
      status: {
        pending: "pending",
        reviewed: "reviewed",
        dash: "—",
      },
      details: {
        statusLabel: "Status",
        worker: "Punëtori",
        department: "Departamenti",
        date: "Data",
        time: "Koha",
        reason: "Arsye",
        report: "Raport",
      },
      create: {
        title: "Shto raport (Manager)",
        subtitle: "Plotëso fushat dhe dërgo raportin.",
        fields: {
          date: "Data",
          timeOut: "Ora e daljes",
          timeReturnOptional: "Ora e kthimit (opsionale)",
          reasonTitle: "Arsyeja e daljes",
          noteOptional: "Shënim (opsionale)",
          reportOptional: "Raport (opsionale)",
        },
        placeholders: {
          note: "Shkruaj shënim...",
          report: "Shkruaj raport...",
        },
        errors: {
          pickReason: "Zgjidh arsyen.",
          pickDate: "Zgjidh datën.",
          pickTimeOut: "Zgjidh orën e daljes.",
        },
      },
      reasons: {
        officialDuty: "Detyrë zyrtare",
        fieldWork: "Dalje në terren",
        personalLeave: "Pushim personal",
        healthReason: "Arsye shëndetësore",
        other: "Tjetër",
      },
    },

    managerWorkers: {
      headerTitle: "Manager • Punëtorët",
      headerSubtitle: "Këtu shfaqen vetëm punëtorët e departamentit tënd.",
      actions: {
        refresh: "Rifresko",
        edit: "Edit",
        delete: "Fshi",
        close: "Mbyll",
        cancel: "Anulo",
        save: "Ruaj",
        saving: "Duke ruajtur…",
        confirmDelete: "Po, fshi",
        deleting: "Duke fshirë…",
      },
      list: {
        title: "Lista e punëtorëve",
        count: "{n} punëtorë",
        empty: "S’ka punëtorë në departament.",
      },
      labels: {
        created: "Krijuar",
        myDepartment: "Departamenti yt",
        roleUser: "user",
      },
      errors: {
        missingUserId: "Missing user id.",
        fillName: "Plotëso emrin.",
        fillUsername: "Plotëso username.",
        passwordTooShort: "Password shumë i shkurtër (min 6).",
      },
      form: {
        fullName: "Emri dhe mbiemri",
        username: "Username",
        newPasswordOptional: "Password i ri (opsional)",
      },
      placeholders: {
        fullName: "p.sh. Punëtor 1",
        username: "p.sh. user1",
        password: "Min 6 karaktere",
      },
      ok: {
        updated: "Punëtori u përditësua.",
        deleted: "Punëtori u fshi.",
      },
      editModal: {
        title: "Edit punëtorin",
        hint: "Nëse e lë bosh, password-i s’ndryshon.",
      },
      deleteModal: {
        title: "Fshi punëtorin",
        question: "A je i sigurt që do ta fshish {name}?",
        workerFallback: "punëtorin",
        warning: "Ky veprim nuk kthehet mbrapsht.",
      },
    },

    superAdminAddUser: {
      headerTitle: "Shto përdorues",
      headerSubtitle: "Krijo llogari të re për superadmin, admin, manager ose user.",
      actions: {
        back: "Kthehu",
        cancel: "Anulo",
        create: "Krijo përdorues",
        creating: "Duke krijuar...",
        refreshDepartments: "Rifresko departamentet",
      },
      cardTitle: "Shto përdorues",
      cardSubtitle: "Forma e krijimit",
      form: {
        fullName: "Emri dhe mbiemri",
        username: "Username",
        role: "Roli",
        department: "Departamenti",
        password: "Password",
        confirmPassword: "Konfirmo password",
      },
      placeholders: {
        fullName: "p.sh. John Doe",
        username: "p.sh. johndoe",
        password: "Minimum 6 karaktere",
        confirmPassword: "Shkruaje përsëri",
      },
      hints: {
        username: "Pa hapësira. Minimum 3 karaktere.",
        role: "User/Manager lidhen me departament. Admin/SuperAdmin jo.",
        departments: "Nëse s’ka departamente, krijoji te /superadmin/departments.",
      },
      roles: {
        user: "User",
        manager: "Manager",
        admin: "Admin",
        superadmin: "SuperAdmin",
      },
      deps: {
        loading: "Duke i ngarkuar…",
        empty: "S’ka departamente (krijo në /superadmin/departments)",
      },
      ok: {
        created: "Përdoruesi u krijua me sukses.",
      },
      errors: {
        loadDepartmentsFailed: "Nuk u arrit me i marrë departamentet.",
        createFailed: "Gabim gjatë krijimit të përdoruesit.",
        fullNameRequired: "Shkruaj emrin dhe mbiemrin.",
        usernameRequired: "Shkruaj username.",
        usernameMin3: "Username duhet të ketë të paktën 3 karaktere.",
        roleInvalid: "Roli nuk është valid.",
        pickDepartment: "Zgjidh departamentin.",
        passwordRequired: "Shkruaj password.",
        passwordMin6: "Password duhet të ketë të paktën 6 karaktere.",
        passwordMismatch: "Password-at nuk përputhen.",
      },
    },

    superAdminDashboard: {
      headerTitle: "SuperAdmin • Panel",
      headerSubtitle: "Statistika + të gjitha raportet + userat.",
      actions: {
        refresh: "Rifresko",
        export: "Eksporto (Excel)",
        exportTitle: "Eksporto raportet",
        exportTitleEmpty: "S’ka raporte për eksport",
      },
      ok: {
        workerAdded: "Punëtori u shtua me sukses.",
        reportReviewed: "Raporti u shënua si reviewed.",
      },
      errors: {
        generic: "Gabim",
      },
      stats: {
        totalReports: "Raporte totale",
        today: "Sot: {n}",
        pending: "Pending",
        pendingSub: "Raporte pa review",
        reviewed: "Reviewed",
        reviewedSub: "Raporte të verifikuara",
        workers: "Punëtorë",
        workersSub: "Admin: {admins} • Total: {total}",
      },
      chart: {
        title: "Raporte (7 ditët e fundit)",
        maxPerDay: "Max/ditë: {n}",
      },
      reports: {
        title: "Të gjitha raportet",
        empty: "S’ka raporte.",
        badges: {
          reviewed: "reviewed",
          pending: "pending",
        },
        actions: {
          verify: "Verifikoje.",
        },
        reviewedAt: "Verifikuar:",
      },
      users: {
        title: "Të gjithë userat",
        total: "Total: {n}",
        empty: "S’ka usera.",
        created: "Krijuar:",
      },
      export: {
        headers: {
          fullName: "Emri",
          status: "Statusi",
          date: "Data",
          timeOut: "Ora e daljes",
          timeReturn: "Ora e kthimit",
          department: "Drejtoria/Sektori",
          reason: "Arsyeja",
          createdAt: "Krijuar",
          reviewedAt: "Reviewed",
        },
      },
    },

    superAdminDepartments: {
      headerTitle: "Departamentet",
      headerSubtitle: "Shto, përditëso dhe fshi departamente.",
      confirmDelete: "A je i sigurt që do ta fshish këtë departament?",
      ok: {
        created: "Departamenti u shtua.",
        updated: "Departamenti u përditësua.",
        deleted: "Departamenti u fshi.",
      },
      errors: {
        generic: "Gabim",
        nameRequired: "Shkruaj emrin e departamentit.",
        nameEmpty: "Emri i departamentit s’mund të jetë bosh.",
      },
      create: {
        title: "Shto departament",
        subtitle: "Emri duhet të jetë unik.",
        nameLabel: "Emri",
        namePlaceholder: "p.sh. Administrata",
        add: "Shto",
      },
      list: {
        title: "Lista",
        totalPrefix: "Totali:",
        empty: "S’ka departamente.",
      },
      edit: {
        nameLabel: "Emri",
      },
      actions: {
        refresh: "Rifresko",
        edit: "Edit",
        delete: "Delete",
        save: "Ruaj",
        cancel: "Anulo",
      },
    },

    superAdminProfile: {
      headerTitle: "Profili (SuperAdmin)",
      headerSubtitle: "Përditëso të dhënat dhe sigurinë e llogarisë.",
      meta: {
        id: "ID",
        created: "Krijuar",
      },
      sections: {
        profile: {
          title: "Të dhënat",
          subtitle: "Ndrysho emrin dhe username-in.",
        },
        security: {
          title: "Siguria",
          subtitle: "Ndrysho password-in.",
        },
      },
      form: {
        fullName: "Emri dhe mbiemri",
        username: "Username",
        currentPassword: "Password aktual",
        newPassword: "Password i ri",
        repeatPassword: "Përsërite password-in",
      },
      placeholders: {
        fullName: "p.sh. Beqir Borova",
        username: "p.sh. u_superadmin",
      },
      actions: {
        saving: "Duke ruajtur...",
        saveChanges: "Ruaj ndryshimet",
        changing: "Duke ndryshuar...",
        changePassword: "Ndrysho password",
      },
      ok: {
        profileUpdated: "Profili u përditësua.",
        passwordUpdated: "Password-i u ndryshua me sukses.",
      },
      errors: {
        generic: "Gabim",
        noUser: "S’u gjet user-i në session.",
        fullNameRequired: "Shkruaj emrin dhe mbiemrin.",
        usernameRequired: "Shkruaj username.",
        currentPasswordRequired: "Shkruaj password-in aktual.",
        newPasswordRequired: "Shkruaj password-in e ri.",
        newPasswordTooShort: "Password-i i ri duhet të ketë së paku 6 karaktere.",
        passwordsNotMatch: "Password-i i ri nuk përputhet.",
      },
    },

    superAdminReports: {
      header: {
        title: "Admin • Raportimet",
        subtitle: "Shfaq të gjitha raportimet (Excel list).",
      },
      actions: {
        refresh: "Rifresko",
        panel: "Paneli",
        verify: "Verifikoje",
        close: "Mbyll",
        delete: "Fshi",
      },
      labels: {
        verified: "Verified",
      },
      loading: "Loading…",
      empty: "S’ka raportime.",
      filter: {
        label: "Filtro:",
        all: "Të gjitha",
        allDepartments: "Të gjitha departamentet",
        department: "Departamenti",
      },
      table: {
        title: "Lista e raportimeve",
        count: "raportime",
        filtered: "filtruar",
        clickForDetails: "Kliko për detaje",
      },
      columns: {
        no: "#",
        worker: "Punëtori",
        date: "Data",
        timeOut: "Time out",
        timeReturn: "Time return",
        reason: "Arsye",
        status: "Status",
        department: "Departamenti",
        created: "Krijuar",
        actions: "Veprime",
      },
      modal: {
        status: "Status",
        worker: "Punëtori",
        department: "Departamenti",
        date: "Data",
        time: "Koha",
        reason: "Arsye",
      },
      confirm: {
        delete: "A je i sigurt që do ta fshish këtë raportim?",
      },
      ok: {
        reviewed: "Raportimi u verifikua.",
        deleted: "Raportimi u fshi.",
      },
      errors: {
        generic: "Gabim",
      },
    },

    superAdminWorkers: {
      header: {
        title: "Admin • Punëtorët",
        subtitle: "Menaxho punëtorët (ndrysho të dhëna / fshij).",
      },
      actions: {
        refresh: "Rifresko",
        panel: "Paneli",
        edit: "Edit",
        delete: "Delete",
        close: "Mbyll",
        cancel: "Anulo",
        save: "Ruaj ndryshimet",
        saving: "Duke ruajtur...",
      },
      loading: "Loading…",
      empty: "S’ka përdorues.",
      filter: {
        label: "Filtro:",
        all: "Të gjitha",
        allDepartments: "Të gjitha departamentet",
        department: "Departamenti",
      },
      list: {
        title: "Lista e përdoruesve",
        count: "përdorues",
        filtered: "filtruar",
      },
      labels: {
        created: "Krijuar",
        noDepartment: "pa department",
      },
      modal: {
        title: "Ndrysho përdoruesin",
      },
      fields: {
        fullName: "Emri dhe mbiemri",
        username: "Username",
        passwordOptional: "Password (lëre bosh mos me ndërru)",
      },
      placeholders: {
        fullName: "p.sh. Arben X",
        username: "p.sh. arben",
      },
      hints: {
        passwordOptional: "Nëse e lë bosh, password-i nuk ndryshohet.",
      },
      confirm: {
        delete: "A je i sigurt që do ta fshish këtë punëtor?",
      },
      ok: {
        updated: "Punëtori u përditësua.",
        deleted: "Punëtori u fshi.",
      },
      errors: {
        generic: "Gabim",
        fullNameRequired: "Shkruaj emrin dhe mbiemrin.",
        usernameRequired: "Shkruaj username.",
        passwordShort: "Password shumë i shkurtër (min 6).",
      },
    },

    userDashboard: {
      reasons: ["Detyrë zyrtare", "Dalje në terren", "Pushim personal", "Arsye shëndetësore", "Tjetër"],
      actions: {
        back: "Kthehu",
        refresh: "Rifresko",
        submit: "SUBMIT",
        submitting: "Duke dërguar…",
      },
      ok: {
        submitted: "Raporti u dërgua me sukses.",
      },
      errors: {
        generic: "Gabim",
        chooseReason: "Zgjidh arsyen.",
        chooseDate: "Zgjidh datën.",
        chooseTimeOut: "Zgjidh orën e daljes.",
      },
      home: {
        primary: { title: "Regjistro dalje", sub: "Regjistro dalje me 1 klik" },
        secondary: { title: "Daljet e mia", sub: "Evidenca e daljeve" },
      },
      mobile: {
        top: {
          homeTitle: "Daljet nga objekti",
          formTitle: "Regjistro Daljen",
          listTitle: "Daljet e mia",
          subtitle: "Komuna e Strugës",
        },
      },
      form: {
        title: "Regjistro Daljen",
        fields: {
          fullName: "Emri dhe Mbiemri",
          workId: "ID e Punës",
          department: "Drejtoria / Sektori",
          reason: "Arsyeja e daljes",
          date: "Data",
          timeOut: "Ora e daljes",
          timeReturn: "Ora e kthimit (opsionale)",
          note: "Shënim (opsionale)",
          raport: "Raport (opsionale)",
        },
        placeholders: {
          note: "Shkruaj shënim...",
          raport: "Shkruaj raport...",
        },
      },
      list: {
        title: "Evidenca e daljeve",
        count: "dalje",
        empty: "S’ka dalje ende.",
        cols: {
          date: "Data",
          name: "Emri",
          department: "Drejtoria",
          details: "Detaje",
        },
        labels: {
          timeOut: "Dalja",
          timeReturn: "Kthimi",
        },
      },
      desktop: {
        header: {
          title: "Raporto dalje më herët",
          subtitle: "Plotëso raportin dhe shiko raportet e tua.",
        },
        form: {
          title: "Dërgo raportim",
          subtitle: "Plotëso fushat poshtë.",
          submit: "Dërgo raportin",
        },
        list: {
          title: "Raportet e mia",
          count: "raporte",
          empty: "S’ka raporte ende.",
        },
        table: {
          date: "Data",
          timeOut: "Ora e daljes",
          timeReturn: "Ora e kthimit",
          reason: "Arsye",
          raport: "Raport",
          status: "Status",
          department: "Drejtoria",
          createdAt: "Krijuar",
        },
      },
    },

    userProfile: {
      title: "Profili im",
      subtitle: "Përditëso emrin dhe (opsionale) ndrysho password-in.",
      hint: "Tip: Nëse s’do me e ndërru password-in, lëri dy fushat bosh.",
      meta: {
        id: "ID",
        role: "Roli",
      },
      form: {
        fullName: "Emri dhe mbiemri",
        password: "Password i ri (opsional)",
        password2: "Përsërite password-in",
        placeholders: {
          fullName: "p.sh. Beqir Borova",
          password: "Min 6 karaktere",
          password2: "Përsërite",
        },
      },
      actions: {
        save: "Ruaj ndryshimet",
        saving: "Duke ruajtur...",
      },
      ok: {
        saved: "Profili u ruajt.",
      },
      errors: {
        generic: "Gabim",
        fullNameRequired: "Shkruaj emrin dhe mbiemrin.",
        passwordMin: "Password-i i ri duhet të ketë së paku 6 karaktere.",
        passwordMatch: "Password-i i ri nuk përputhet.",
      },
    },

    sidebar: {
      logoAlt: "Logo",
      fallbacks: {
        user: "User",
        username: "user",
      },
      lang: {
        sq: "Shqip",
        mk: "Македонски",
      },
      links: {
        admin: {
          panel: "Panel",
          reports: "Raportimet",
          departments: "Departamentet",
          workers: "Punëtorët",
          addUser: "Shto përdorues",
        },
        superadmin: {
          panel: "Panel",
          reports: "Raportimet",
          departments: "Departamentet",
          workers: "Punëtorët",
          addUser: "Shto përdorues",
        },
        manager: {
          panel: "Paneli",
          reports: "Raportimet",
          workers: "Punëtorët",
          addWorker: "Shto Punëtorë",
        },
        user: {
          myReports: "Raportet e mia",
        },
      },
      bottom: {
        profile: "Profili im",
      },
      actions: {
        logout: "Logout",
      },
    },

    topbar: {
      logoAlt: "Logo",
      appName: "Raportimi i punës",
      fallbacks: {
        title: "Komuna",
        username: "raportimi",
      },
      lang: {
        sq: "Shqip",
        mk: "Македонски",
      },
      actions: {
        openMenu: "Hap menunë",
        closeMenu: "Mbyll menunë",
        myProfile: "Profili im",
        logout: "Logout",
      },
      links: {
        admin: {
          panel: "Panel",
          reports: "Raportimet",
          departments: "Departamentet",
          workers: "Punëtorët",
          addUser: "Shto përdorues",
        },
        superadmin: {
          panel: "Panel",
          reports: "Raportimet",
          departments: "Departamentet",
          workers: "Punëtorët",
          addUser: "Shto përdorues",
        },
        manager: {
          panel: "Paneli",
          reports: "Raportimet",
          workers: "Punëtorët",
          addWorker: "Shto Punëtorë",
        },
        user: {
          myReports: "Raportet e mia",
        },
      },
    },
    // DICT.mk
login: {
  logoAlt: "Komuna",
  title: "Login",
  subtitle: "Kyçu për të vazhduar.",
  fields: { username: "Username", password: "Password" },
  placeholders: { username: "Username...", password: "Password..." },
  actions: { submit: "Hyr", loggingIn: "Duke u kyçur..." },
  footer: "Komuna e Strugës",
},

  },

  mk: {
    langName: "Македонски",
    toggleLabel: "Јазик",
    common: COMMON_MK,

    adminAddUser: {
      title: "Додај корисник",
      subtitle: "Креирај само User сметки (со одделение).",
      cardTitle: "Додај корисник",
      cardNote: "Само User",
      fields: {
        fullName: { label: "Име и презиме", placeholder: "пр. John Doe" },
        username: {
          label: "Корисничко име",
          placeholder: "пр. johndoe",
          help: "Без празни места. Минимум 3 знаци.",
        },
        department: {
          label: "Одделение",
          loading: "Се вчитува…",
          empty: "Нема одделенија",
          refreshTitle: "Освежи одделенија",
        },
        password: { label: "Лозинка", placeholder: "Минимум 6 знаци" },
        confirmPassword: {
          label: "Потврди лозинка",
          placeholder: "Внеси повторно",
        },
      },
      actions: { create: "Креирај корисник", creating: "Се креира..." },
      ok: { userCreated: "Корисникот е успешно креиран." },
      errors: {
        depsFetchFail: "Не успеавме да ги вчитаме одделенијата.",
        fullNameRequired: "Внеси име и презиме.",
        usernameRequired: "Внеси корисничко име.",
        usernameMin3: "Корисничкото име мора да има најмалку 3 знаци.",
        departmentRequired: "Избери одделение.",
        passwordRequired: "Внеси лозинка.",
        passwordMin6: "Лозинката мора да има најмалку 6 знаци.",
        passwordMismatch: "Лозинките не се совпаѓаат.",
        createFail: "Грешка при креирање корисник.",
      },
    },

    adminDashboard: {
      headerTitle: "Админ • Панел",
      headerSubtitle: "Статистика + последни извештаи.",
      export: {
        button: "Експорт (Excel)",
        title: "Експорт на извештаи",
        noReportsTitle: "Нема извештаи за експорт",
      },
      ok: {
        workerAdded: "Работникот е успешно додаден.",
        reportReviewed: "Извештајот е означен како потврден.",
      },
      stats: {
        totalReports: "Вкупно извештаи",
        today: "Денес: {n}",
        pending: "На чекање",
        pendingSub: "Непотврдени извештаи",
        reviewed: "Потврдени",
        reviewedSub: "Потврдени извештаи",
        workers: "Работници",
      },
      chart: {
        title: "Извештаи (последни 7 дена)",
        maxPerDay: "Макс/ден: {n}",
      },
      list: {
        title: "Сите извештаи",
        empty: "Нема извештаи.",
      },
      status: {
        reviewed: "потврден",
        pending: "на чекање",
      },
      actions: {
        verify: "Потврди",
      },
      verifiedAt: "Потврдено: {date}",
      csv: {
        filePrefix: "izvestai",
        name: "Име",
        status: "Статус",
        date: "Датум",
        timeOut: "Време на излегување",
        timeReturn: "Време на враќање",
        department: "Сектор/Одделение",
        reason: "Причина",
        created: "Креирано",
        reviewed: "Потврдено",
      },
    },

    adminDepartments: {
      title: "Одделенија",
      subtitle: "Листа на одделенија + статистика (работници и извештаи).",
      list: {
        title: "Листа",
        total: "Вкупно",
        empty: "Нема одделенија.",
      },
      badges: {
        workers: "{n} работници",
        reports: "{n} извештаи",
      },
      details: {
        title: "Детали",
        hint: "Кликни одделение за да ја видиш статистиката.",
        pickFromLeft: "Избери одделение од листата лево.",
      },
      cards: {
        workersTitle: "Работници",
        workersSub: "во ова одделение",
        reportsTitle: "Извештаи",
        reportsSub: "испратени",
      },
      workersList: {
        title: "Работници",
        empty: "Нема работници.",
      },
    },

    adminProfile: {
      title: "Профил (Админ)",
      subtitle: "Ажурирај ги податоците и безбедноста на сметката.",
      meta: {
        id: "ID",
        created: "Креирано",
      },
      sections: {
        data: {
          title: "Податоци",
          subtitle: "Промени име и корисничко име.",
        },
        security: {
          title: "Безбедност",
          subtitle: "Промени лозинка.",
        },
      },
      fields: {
        fullName: { label: "Име и презиме", placeholder: "пр. Beqir Borova" },
        username: { label: "Корисничко име", placeholder: "пр. u_admin" },
        currentPassword: { label: "Тековна лозинка" },
        newPassword: { label: "Нова лозинка" },
        repeatPassword: { label: "Повтори лозинка" },
      },
      actions: {
        saving: "Се зачувува...",
        saveChanges: "Зачувај промени",
        changing: "Се менува...",
        changePassword: "Промени лозинка",
      },
      ok: {
        profileUpdated: "Профилот е ажуриран.",
        passwordChanged: "Лозинката е успешно променета.",
      },
      errors: {
        fullNameRequired: "Внеси име и презиме.",
        usernameRequired: "Внеси корисничко име.",
        currentPasswordRequired: "Внеси ја тековната лозинка.",
        newPasswordRequired: "Внеси нова лозинка.",
        newPasswordMin6: "Новата лозинка мора да има најмалку 6 знаци.",
        newPasswordMismatch: "Новата лозинка не се совпаѓа.",
      },
    },

    adminReports: {
      headerTitle: "Админ • Извештаи",
      headerSubtitle: "Прикажи ги сите извештаи (Excel листа).",
      filter: {
        allDepartments: "Сите одделенија",
        departmentPrefix: "Одделение: {name}",
        label: "Филтер:",
        allOption: "Сите",
      },
      list: {
        title: "Листа на извештаи",
        count: "{n} извештаи",
        filteredSuffix: " (филтрирано)",
        empty: "Нема извештаи.",
      },
      table: {
        worker: "Работник",
        date: "Датум",
        timeOut: "Време излез",
        timeReturn: "Време враќање",
        reason: "Причина",
        status: "Статус",
        department: "Одделение",
        created: "Креирано",
        actions: "Акции",
        clickForDetails: "Кликни за детали",
      },
      actions: {
        dashboard: "Панел",
        verify: "Потврди",
        verified: "Потврдено",
      },
      ok: {
        verified: "Извештајот е потврден.",
      },
      modal: {
        status: "Статус",
        worker: "Работник",
        department: "Одделение",
        date: "Датум",
        time: "Време",
        reason: "Причина",
      },
    },

    adminWorkers: {
      headerTitle: "Админ • Работници",
      headerSubtitle: "Листа на работници (само приказ).",
      actions: {
        dashboard: "Панел",
      },
      filter: {
        allDepartments: "Сите одделенија",
        departmentPrefix: "Одделение: {name}",
        label: "Филтер:",
        allOption: "Сите",
      },
      list: {
        title: "Листа на корисници",
        count: "{n} корисници",
        filteredSuffix: " (филтрирано)",
        empty: "Нема корисници.",
      },
      labels: {
        created: "Креирано",
        noDepartment: "без одделение",
      },
    },

    managerAddUser: {
      headerTitle: "Менаџер • Додај работник",
      headerSubtitle: "Креирај работник само за твоето одделение.",
      form: {
        fullName: "Име и презиме",
        username: "Корисничко име",
        password: "Лозинка",
      },
      placeholders: {
        fullName: "пр. Арбен X",
        username: "пр. arben",
        password: "мин 6",
      },
      actions: {
        addWorker: "Додај работник",
      },
      ok: {
        added: "Работникот е додаден.",
      },
      errors: {
        noDepartmentId: "Менаџерот нема departmentId. Провери user session.",
        fillAll: "Пополнете fullName, username, password.",
        passwordTooShort: "Лозинката е премногу кратка (мин 6).",
      },
    },

    managerDashboard: {
      headerTitle: "Менаџер • Панел",
      headerSubtitle: "Статистика + извештаи на одделот.",
      actions: {
        refresh: "Освежи",
      },
      alerts: {
        loading: "Се вчитува…",
      },
      stats: {
        totalReports: {
          title: "Вкупно извештаи",
          subToday: "Денес: {n}",
        },
        pending: {
          title: "На чекање",
          sub: "Без проверка",
        },
        reviewed: {
          title: "Проверени",
          sub: "Проверени",
        },
        workers: {
          title: "Работници",
          sub: "Твојот оддел",
        },
      },
      chart: {
        title: "Извештаи (последни 7 дена)",
        maxPerDay: "Макс./ден: {n}",
      },
      latest: {
        title: "Последни извештаи",
        empty: "Нема извештаи.",
      },
      status: {
        reviewed: "проверено",
        pending: "на чекање",
      },
    },

    managerProfile: {
      headerTitle: "Менаџер • Мој профил",
      headerSubtitle: "Промени име и лозинка.",
      form: {
        fullName: "Име и презиме",
        username: "Корисничко име",
        newPassword: "Нова лозинка",
        confirmPassword: "Повтори лозинка",
      },
      placeholders: {
        fullName: "пр. Арбен X",
        password: "••••••••",
      },
      hints: {
        usernameReadonly: "Корисничкото име не се менува тука.",
      },
      actions: {
        logout: "Одјави се",
        refresh: "Освежи",
        save: "Зачувај",
        saving: "Се зачувува...",
      },
      ok: {
        saved: "Профилот е зачуван.",
      },
      errors: {
        fullNameRequired: "Пополнете име и презиме.",
        passwordTooShort: "Лозинката е премногу кратка (мин 6).",
        passwordMismatch: "Лозинките не се совпаѓаат.",
      },
    },

    managerReports: {
      headerTitle: "Менаџер • Извештаи",
      headerSubtitle: "Прикажи ги извештаите на работниците од твоето одделение.",
      actions: {
        addReport: "Додај извештај",
        refresh: "Освежи",
        close: "Затвори",
        verify: "Провери",
        verified: "Проверено",
        sending: "Се испраќа…",
        sendReport: "Испрати извештај",
      },
      ok: {
        verified: "Извештајот е проверен.",
        sent: "Извештајот е успешно испратен.",
      },
      empty: {
        noReports: "Нема извештаи.",
      },
      list: {
        title: "Листа на извештаи",
        count: "{n} извештаи",
      },
      table: {
        index: "#",
        worker: "Работник",
        date: "Датум",
        timeOut: "Излез",
        timeReturn: "Враќање",
        reason: "Причина",
        report: "Извештај",
        status: "Статус",
        department: "Одделение",
        created: "Креирано",
        actions: "Акции",
        clickForDetails: "Кликни за детали",
      },
      status: {
        pending: "во чекање",
        reviewed: "проверено",
        dash: "—",
      },
      details: {
        statusLabel: "Статус",
        worker: "Работник",
        department: "Одделение",
        date: "Датум",
        time: "Време",
        reason: "Причина",
        report: "Извештај",
      },
      create: {
        title: "Додај извештај (Менаџер)",
        subtitle: "Пополнете ги полињата и испратете го извештајот.",
        fields: {
          date: "Датум",
          timeOut: "Време на излез",
          timeReturnOptional: "Време на враќање (опционално)",
          reasonTitle: "Причина за излез",
          noteOptional: "Забелешка (опционално)",
          reportOptional: "Извештај (опционално)",
        },
        placeholders: {
          note: "Напиши забелешка...",
          report: "Напиши извештај...",
        },
        errors: {
          pickReason: "Избери причина.",
          pickDate: "Избери датум.",
          pickTimeOut: "Избери време на излез.",
        },
      },
      reasons: {
        officialDuty: "Службена задача",
        fieldWork: "Излез на терен",
        personalLeave: "Лично отсуство",
        healthReason: "Здравствена причина",
        other: "Друго",
      },
    },

    managerWorkers: {
      headerTitle: "Менаџер • Работници",
      headerSubtitle: "Тука се прикажуваат само работниците од твоето одделение.",
      actions: {
        refresh: "Освежи",
        edit: "Уреди",
        delete: "Избриши",
        close: "Затвори",
        cancel: "Откажи",
        save: "Зачувај",
        saving: "Се зачувува…",
        confirmDelete: "Да, избриши",
        deleting: "Се брише…",
      },
      list: {
        title: "Листа на работници",
        count: "{n} работници",
        empty: "Нема работници во одделението.",
      },
      labels: {
        created: "Креирано",
        myDepartment: "Твоето одделение",
        roleUser: "user",
      },
      errors: {
        missingUserId: "Недостасува user id.",
        fillName: "Внеси име.",
        fillUsername: "Внеси корисничко име.",
        passwordTooShort: "Лозинката е премногу кратка (мин 6).",
      },
      form: {
        fullName: "Име и презиме",
        username: "Корисничко име",
        newPasswordOptional: "Нова лозинка (опционално)",
      },
      placeholders: {
        fullName: "пр. Работник 1",
        username: "пр. user1",
        password: "Мин 6 карактери",
      },
      ok: {
        updated: "Работникот е ажуриран.",
        deleted: "Работникот е избришан.",
      },
      editModal: {
        title: "Уреди работник",
        hint: "Ако го оставиш празно, лозинката нема да се промени.",
      },
      deleteModal: {
        title: "Избриши работник",
        question: "Дали си сигурен дека сакаш да го избришеш {name}?",
        workerFallback: "работникот",
        warning: "Оваа акција не може да се врати назад.",
      },
    },

    sidebar: {
      logoAlt: "Лого",
      fallbacks: {
        user: "Корисник",
        username: "user",
      },
      lang: {
        sq: "Shqip",
        mk: "Македонски",
      },
      links: {
        admin: {
          panel: "Панел",
          reports: "Извештаи",
          departments: "Оддели",
          workers: "Вработени",
          addUser: "Додај корисник",
        },
        superadmin: {
          panel: "Панел",
          reports: "Извештаи",
          departments: "Оддели",
          workers: "Вработени",
          addUser: "Додај корисник",
        },
        manager: {
          panel: "Панел",
          reports: "Извештаи",
          workers: "Вработени",
          addWorker: "Додај вработени",
        },
        user: {
          myReports: "Мои извештаи",
        },
      },
      bottom: {
        profile: "Мој профил",
      },
      actions: {
        logout: "Одјава",
      },
    },

    topbar: {
      logoAlt: "Лого",
      appName: "Евиденција на работа",
      fallbacks: {
        title: "Општина",
        username: "izvestuvanje",
      },
      lang: {
        sq: "Shqip",
        mk: "Македонски",
      },
      actions: {
        openMenu: "Отвори мени",
        closeMenu: "Затвори мени",
        myProfile: "Мој профил",
        logout: "Одјава",
      },
      links: {
        admin: {
          panel: "Панел",
          reports: "Извештаи",
          departments: "Оддели",
          workers: "Вработени",
          addUser: "Додај корисник",
        },
        superadmin: {
          panel: "Панел",
          reports: "Извештаи",
          departments: "Оддели",
          workers: "Вработени",
          addUser: "Додај корисник",
        },
        manager: {
          panel: "Панел",
          reports: "Извештаи",
          workers: "Вработени",
          addWorker: "Додај вработени",
        },
        user: {
          myReports: "Мои извештаи",
        },
      },
    },
    // DICT.mk
login: {
  logoAlt: "Општина",
  title: "Најава",
  subtitle: "Најави се за да продолжиш.",
  fields: { username: "Корисничко име", password: "Лозинка" },
  placeholders: { username: "Корисничко име...", password: "Лозинка..." },
  actions: { submit: "Влези", loggingIn: "Се најавува..." },
  footer: "Општина Струга",
},

  },
};
