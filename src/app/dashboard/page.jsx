"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import DashboardStats from "@/components/dashboard/DashboardStats";
import PurchasesPage from "./purchases/page";
import SalesPage from "./sales/page";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";

export default function DashboardPage() {

    return (
        <SalesPage />
    );
}
