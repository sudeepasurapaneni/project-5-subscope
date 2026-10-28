# 🔎 SubScope — CT Data Analyzer

**An offline educational tool for Certificate Transparency (CT) record analysis.**

SubScope helps users analyze existing Certificate Transparency records or hostname lists to identify hostnames associated with a specified domain. It filters the supplied data locally, removes duplicates, and presents matching results in a searchable interface.

> **Privacy first:** SubScope is designed for local analysis. It does not contact Certificate Transparency services, perform DNS queries, or discover subdomains independently.

## ✨ Features

- **Domain Input:** Enter a target domain to define the analysis scope.
- **Multiple Input Formats:** Paste records or upload supported JSON/TXT files.
- **CT Record Parsing:** Supports `crt.sh` JSON, records containing `dns_names` or `common_name`, and plain hostname lists.
- **Domain Matching:** Includes only the exact target domain and its subdomains.
- **Duplicate Removal:** Eliminates duplicate hostname entries.
- **Searchable Results:** Browse and search the matching hostnames.
- **CSV Export:** Export analysis results for further review.
- **Error Handling:** Provides feedback for invalid input and unsupported or malformed records.
- **Offline Analysis:** Processes the supplied records without sending them to external services.

## 🛠️ How It Works

1. **Enter a target domain.** Provide a hostname domain, such as `example.com`, rather than a URL or IP address.
2. **Import records.** Paste CT records or upload a supported JSON/TXT file.
3. **Validate the input.** The application checks the target domain and processes the supplied records.
4. **Extract hostnames.** Supported fields and plain hostname entries are examined.
5. **Filter by domain.** Only the exact target domain and hostnames ending with the target domain as a separate DNS label are retained.
6. **Remove duplicates.** Repeated hostname entries are eliminated.
7. **Review and export.** View searchable results and export them as CSV.

### Example

For the target domain `example.com`:

| Input hostname | Result |
|---|---|
| `example.com` | Included |
| `api.example.com` | Included |
| `mail.example.com` | Included |
| `notexample.com` | Excluded |
| `example.org` | Excluded |

These examples illustrate the filtering rules; they are not actual scan findings.

## 🔐 Privacy and Safety

SubScope is designed to analyze data supplied by the user.

- No CT services are queried.
- No DNS lookups are performed.
- No live subdomain discovery is performed.
- Imported records are analyzed locally in the application.
- DNS status remains **Not checked**.
- Results reflect only the supplied dataset.

Use records you are authorized to analyze and follow applicable security assessment policies.

## 📂 Supported Input

SubScope supports the following input types:

- **`crt.sh` JSON:** Certificate Transparency records in a supported JSON structure.
- **`dns_names`:** Records containing a list of DNS names.
- **`common_name`:** Records containing a certificate common name.
- **Plain hostnames:** Text lists containing one hostname per line.

Pasted text is limited to 1 MB. File upload support depends on the formats accepted by the application.

## 🧰 Technology

SubScope is a browser-based educational application. The project includes its application source code, documentation, and unit tests.

Consult the source files and project configuration for the exact framework, dependencies, and execution instructions.

## ⚠️ Limitations

- SubScope can analyze only the records supplied by the user.
- Hostnames absent from the input data cannot be discovered.
- Imported records may be historical or incomplete.
- A matching hostname does not prove that it is currently active or reachable.
- DNS status is not verified.
- Results depend on the structure and quality of the imported data.
- SubScope is not a complete security audit or vulnerability scanner.

## 🎯 Project Objective

The objective of SubScope is to demonstrate the fundamentals of subdomain enumeration data analysis, domain validation, hostname filtering, deduplication, and results presentation in a privacy-conscious educational environment.

## 🧪 Testing

The project includes unit tests for the implemented functionality.

Run the tests using the command appropriate to the project's package manager and test configuration. Refer to the project files for the exact command.

## 👩‍💻 Author

**Sudeepa**

GitHub: [@sudeepasurapaneni](https://github.com/sudeepasurapaneni)

## 📄 License

No license has been specified. Contact the repository owner for permission before redistributing or reusing this project.
