// 3rd-party module
const { validationResult } = require("express-validator");
const PDFDocument = require("pdfkit");

// import model

// import repositories
const bookingRepo = require("../repositories/booking.repositories");
const technicianRepo = require("../../technician/repositories/technician.repositories");

// import others

// Define booking Controller
class ServiceBookingContoller {
  // Define Create booking Table Page controller method
  async createServiceBookingTablePage(req, res) {
    // Get total Service Category list
    const bookingList = await bookingRepo.getAllBookingList();

    try {
      res.render("bookings/views/bookingTable.ejs", {
        title: "Booking Table",
        // Send path
        path: {
          home: "/admin" + generateUrl("admin-dashboard-page"),
          logout: "/admin" + generateUrl("admin.logout"),
        },
        content: {
          firstName: req.admin.firstName,
          role: req.admin.role,
          profileImageUrl: req.admin.profileImage,
        },
        data: {
          bookingList,
        },
      });
    } catch (error) {
      console.error("Error rendering admin registration page:", error);
      res
        .status(500)
        .send("An error occurred while loading the registration page");
    }
  }

  // Define viewBookingPage controller method
  async viewBookingPage(req, res) {
    const orderID = req.params.id;

    // Get total Service Category list
    const bookingDetails = await bookingRepo.getSingleBookingDetails(orderID);

    // Get all technician list of respective service
    const technicians = await technicianRepo.categoryWiseTechnician(
      bookingDetails
    );

    // Get technicain notes
    const notes = await technicianRepo.getNotes(bookingDetails._id);

    try {
      res.render("bookings/views/viewBooking.ejs", {
        title: "Booking Table",
        // Send path
        path: {
          home: "/admin" + generateUrl("admin-dashboard-page"),
          logout: "/admin" + generateUrl("admin.logout"),
        },
        content: {
          firstName: req.admin.firstName,
          role: req.admin.role,
          profileImageUrl: req.admin.profileImage,
        },
        data: {
          bookingDetails,
          technicians,
          notes,
        },
      });
    } catch (error) {
      console.error("Error rendering admin registration page:", error);
      res
        .status(500)
        .send("An error occurred while loading the registration page");
    }
  }

  // Define export to pdf controller method
  async exportBookingList(req, res) {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({
        margin: 50,
        size: "A4",
      });

      // Set response headers for PDF download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=bookings.pdf");

      // Pipe the PDF document to the response
      doc.pipe(res);

      // Add heading
      doc
        .fontSize(20)
        .text("Booking List Report", {
          align: "center",
        })
        .moveDown(2);

      // Add generated date
      doc
        .fontSize(10)
        .text(`Generated on: ${new Date().toLocaleString()}`)
        .moveDown(2);

      // Define table columns
      const tableTop = 150;
      const orderNoX = 50;
      const customerNameX = 120;
      const serviceCategoryX = 220;
      const bookingsX = 320;
      const statusX = 420;

      // Add table headers
      doc
        .fontSize(12)
        .text("Order No.", orderNoX, tableTop)
        .text("Customer", customerNameX, tableTop)
        .text("Category", serviceCategoryX, tableTop)
        .text("Booking", bookingsX, tableTop)
        .text("Status", statusX, tableTop);

      // Draw header line
      doc
        .moveTo(50, tableTop + 20)
        .lineTo(550, tableTop + 20)
        .stroke();

      // Add table rows
      let yPosition = tableTop + 40;

      // Get booking list from your database
      const bookings = await bookingRepo.getAllBookingList();

      bookings.forEach((booking) => {
        // Check if we need a new page
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;

          // Add headers on new page
          doc
            .fontSize(12)
            .text("Order No.", orderNoX, yPosition)
            .text("Customer", customerNameX, yPosition)
            .text("Category", serviceCategoryX, yPosition)
            .text("Booking", bookingsX, yPosition)
            .text("Status", statusX, yPosition);

          doc
            .moveTo(50, yPosition + 20)
            .lineTo(550, yPosition + 20)
            .stroke();

          yPosition += 40;
        }

        doc
          .fontSize(10)
          .text(String(booking._id).slice(-5), orderNoX, yPosition)
          .text(booking.customer.name, customerNameX, yPosition)
          .text(booking.serviceCategory.name, serviceCategoryX, yPosition)
          .text(booking.subCategory.name, bookingsX, yPosition)
          .text(booking.status, statusX, yPosition);

        // Add light gray line between rows
        doc
          .moveTo(50, yPosition + 20)
          .lineTo(550, yPosition + 20)
          .stroke("#dddddd");

        yPosition += 30;
      });

      // Add footer with page numbers
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc
          .fontSize(8)
          .text(`Page ${i + 1} of ${pageCount}`, 50, doc.page.height - 50, {
            align: "center",
          });
      }

      // Finalize the PDF
      doc.end();
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).send("Error generating PDF");
    }
  }

  // Define exportBooking controller method
  async exportBookingDetails(req, res) {
    try {
      const orderID = req.params.id;
      const booking = await bookingRepo.getSingleBookingDetails(orderID);

      if (!booking) {
        return res.status(404).send("Booking not found");
      }

      // Create PDF with better formatting
      const doc = new PDFDocument({
        margin: 50,
        size: "A4",
        bufferPages: true,
      });

      // Set response headers
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=booking-${booking._id}.pdf`
      );

      // Pipe to response
      doc.pipe(res);

      // Define column widths and positions
      const columnWidth = 240;
      const leftColumnX = 50;
      const rightColumnX = 320;

      // Helper function to add section title
      const addSectionTitle = (title, x, startY = doc.y) => {
        doc.y = startY;
        doc
          .fontSize(12)
          .fillColor("#2c3e50")
          .text(title, x, doc.y)
          .moveDown(0.2)
          .lineWidth(0.5)
          .moveTo(x, doc.y)
          .lineTo(x + columnWidth, doc.y)
          .stroke("#3498db")
          .moveDown(0.3);
        return doc.y;
      };

      // Helper function for content text
      const addContentText = (label, value, x, startY = doc.y) => {
        doc.y = startY;
        doc
          .fontSize(10)
          .fillColor("#7f8c8d")
          .text(label, x, startY, { continued: true, width: columnWidth })
          .fillColor("#2c3e50")
          .text(`: ${value}`, { width: columnWidth })
          .moveDown(0.5);
        return doc.y;
      };

      // Add header with company details
      doc
        .fontSize(20)
        .fillColor("#2c3e50")
        .text("Booking Details", { align: "center" })
        .moveDown(0.5);

      // Add booking summary box
      doc.rect(50, doc.y, 495, 70).fillAndStroke("#f7f9fc", "#bdc3c7");

      const summaryY = doc.y + 15;
      doc.fontSize(11).fillColor("#34495e");

      // Add summary content in two rows
      doc
        .text(`Booking ID: #${booking._id}`, 70, summaryY)
        .text(`Status: ${booking.status.toUpperCase()}`, 300, summaryY)
        .text(
          `Created: ${new Date(booking.bookingDate).toLocaleDateString()}`,
          70,
          summaryY + 25
        )
        .text(
          `Payment: ${booking.paymentStatus.toUpperCase()}`,
          300,
          summaryY + 25
        );

      doc.moveDown(4);

      let leftY = doc.y;
      let rightY = doc.y;

      // Left Column
      // Customer Information
      leftY = addSectionTitle("Customer Information", leftColumnX, leftY);
      leftY = addContentText("Name", booking.customer.name, leftColumnX, leftY);
      leftY = addContentText(
        "Address",
        booking.customer.address.street +
          " " +
          booking.customer.address.landmark +
          " " +
          booking.customer.address.city +
          " " +
          booking.customer.address.state,
        leftColumnX,
        leftY
      );
      leftY = addContentText(
        "Phone",
        booking.customer.phone || "N/A",
        leftColumnX,
        leftY
      );
      leftY = addContentText(
        "Email",
        booking.customer.email || "N/A",
        leftColumnX,
        leftY
      );
      leftY += 10;

      // Service Information
      leftY = addSectionTitle("Service Information", leftColumnX, leftY);
      leftY = addContentText(
        "Category",
        booking.serviceCategory.name,
        leftColumnX,
        leftY
      );
      leftY = addContentText(
        "Service Type",
        booking.subCategory.name,
        leftColumnX,
        leftY
      );
      if (booking.description) {
        leftY = addContentText(
          "Description",
          booking.description,
          leftColumnX,
          leftY
        );
      }
      leftY += 10;

      // Schedule Information
      leftY = addSectionTitle("Schedule Information", leftColumnX, leftY);
      leftY = addContentText(
        "Preferred Date",
        new Date(booking.preferredDate).toLocaleDateString(),
        leftColumnX,
        leftY
      );
      leftY = addContentText(
        "Preferred Time",
        booking.preferredTimeSlot,
        leftColumnX,
        leftY
      );
      leftY = addContentText(
        "Expected Completion",
        new Date(booking.completionDate).toLocaleDateString(),
        leftColumnX,
        leftY
      );

      // Right Column
      // Payment Information
      rightY = addSectionTitle("Payment Details", rightColumnX, rightY);
      rightY = addContentText(
        "Payment Status",
        booking.paymentStatus,
        rightColumnX,
        rightY
      );
      rightY = addContentText(
        "Payment Method",
        booking.paymentMethod || "Not specified",
        rightColumnX,
        rightY
      );
      rightY = addContentText(
        "Amount",
        booking.amount || "To be decided",
        rightColumnX,
        rightY
      );
      rightY += 10;

      // Technician Information
      if (booking.technician) {
        rightY = addSectionTitle("Technician Details", rightColumnX, rightY);
        rightY = addContentText(
          "Name",
          booking.technician.name,
          rightColumnX,
          rightY
        );
        rightY = addContentText(
          "Specialization",
          booking.technician.specialization || "N/A",
          rightColumnX,
          rightY
        );
        rightY = addContentText(
          "Assignment Date",
          new Date(booking.technicianAssignedAt).toLocaleDateString(),
          rightColumnX,
          rightY
        );
        rightY = addContentText(
          "Experience",
          `${booking.technician.experience || "N/A"} years`,
          rightColumnX,
          rightY
        );
        rightY += 10;
      }

      // Status Information
      rightY = addSectionTitle("Status Information", rightColumnX, rightY);
      rightY = addContentText(
        "Current Status",
        booking.status,
        rightColumnX,
        rightY
      );
      rightY = addContentText(
        "Last Updated",
        new Date(booking.updatedAt).toLocaleDateString(),
        rightColumnX,
        rightY
      );

      // Rejection Information (if applicable)
      if (booking.status === "rejected" && booking.notes?.reasonForRejection) {
        rightY += 10;
        rightY = addSectionTitle("Rejection Details", rightColumnX, rightY);

        // Create a highlighted box for rejection reason
        doc
          .rect(rightColumnX, rightY, columnWidth, 60)
          .fillAndStroke("#fee2e2", "#ef4444");

        doc
          .fontSize(10)
          .fillColor("#7f2121")
          .text(
            booking.notes.reasonForRejection,
            rightColumnX + 10,
            rightY + 10,
            {
              width: columnWidth - 20,
              align: "justify",
            }
          );

        rightY += 70;
      }

      // Draw separator line between columns
      doc
        .lineWidth(0.5)
        .moveTo(
          leftColumnX + columnWidth + 15,
          doc.y - Math.max(rightY, leftY) + 100
        )
        .lineTo(leftColumnX + columnWidth + 15, doc.y - 400)
        .stroke("#bdc3c7");

      // Add footer
      const bottomY = doc.page.height - 100;

      // Add line above footer
      doc
        .lineWidth(0.5)
        .moveTo(50, bottomY)
        .lineTo(545, bottomY)
        .stroke("#bdc3c7");

      // Footer text
      doc
        .fontSize(8)
        .fillColor("#7f8c8d")
        .text(
          "This is a computer-generated document. No signature is required.",
          50,
          bottomY + 15,
          { align: "center" }
        )
        .moveDown(0.5)
        .text(`Generated on: ${new Date().toLocaleString()}`, {
          align: "center",
        })
        .text(`Page 1 of 1`, { align: "center" });

      // Error handling
      doc.on("error", (err) => {
        console.error("Error in PDF generation:", err);
        res.status(500).end();
      });

      // Finalize the PDF
      doc.end();
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).send("Error generating PDF");
    }
  }

  // Define print booking details controller method
  async printBookingDetails(req, res) {
    try {
      const booking = await bookingRepo.getSingleBookingDetails(req.params.id);
      if (!booking) {
        return res.status(404).send("Booking not found");
      }
      res.render("bookings/views/booking-print", {
        layout: false,
        data: { bookingDetails: booking },
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Error generating print view");
    }
  }
}

module.exports = new ServiceBookingContoller();
